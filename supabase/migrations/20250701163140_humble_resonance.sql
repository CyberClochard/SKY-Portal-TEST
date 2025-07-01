/*
  # Création des tables pour la gestion de stock LTA

  1. Nouvelles Tables
    - `lta_stock` - Table principale des LTA avec gestion des quantités
    - `lta_stock_movements` - Historique de tous les mouvements de stock
    - `lta_alerts` - Système d'alertes pour les stocks bas
    - `lta_restock_orders` - Commandes de réapprovisionnement
    - `lta_restock_order_items` - Détails des articles commandés

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies pour les utilisateurs authentifiés

  3. Fonctionnalités
    - Calculs automatiques des quantités disponibles
    - Triggers pour la mise à jour des timestamps
    - Contraintes de validation des données
*/

-- Table principale des LTA
CREATE TABLE IF NOT EXISTS lta_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lta_number varchar(20) UNIQUE NOT NULL,
  airline_code varchar(3) NOT NULL,
  airline_name varchar(100) NOT NULL,
  stock_type varchar(20) NOT NULL DEFAULT 'physical', -- 'physical', 'electronic', 'hybrid'
  current_quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer NOT NULL DEFAULT 0,
  available_quantity integer GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
  minimum_threshold integer NOT NULL DEFAULT 10,
  maximum_capacity integer DEFAULT 1000,
  unit_cost decimal(10,2) DEFAULT 0.00,
  supplier varchar(100),
  location varchar(100) DEFAULT 'Entrepôt Principal',
  status varchar(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'discontinued'
  last_restock_date timestamptz,
  next_restock_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_quantities CHECK (current_quantity >= 0 AND reserved_quantity >= 0),
  CONSTRAINT valid_threshold CHECK (minimum_threshold >= 0),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'discontinued')),
  CONSTRAINT valid_stock_type CHECK (stock_type IN ('physical', 'electronic', 'hybrid'))
);

-- Historique des mouvements de stock
CREATE TABLE IF NOT EXISTS lta_stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lta_id uuid REFERENCES lta_stock(id) ON DELETE CASCADE,
  movement_type varchar(20) NOT NULL, -- 'in', 'out', 'reserved', 'unreserved', 'adjustment'
  quantity integer NOT NULL,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  reference_number varchar(50), -- Numéro de commande, dossier, etc.
  reason varchar(200),
  user_id uuid, -- Qui a fait le mouvement
  user_name varchar(100) DEFAULT 'Système',
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_movement_type CHECK (movement_type IN ('in', 'out', 'reserved', 'unreserved', 'adjustment')),
  CONSTRAINT valid_quantity CHECK (quantity != 0)
);

-- Alertes et notifications
CREATE TABLE IF NOT EXISTS lta_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lta_id uuid REFERENCES lta_stock(id) ON DELETE CASCADE,
  alert_type varchar(30) NOT NULL, -- 'low_stock', 'out_of_stock', 'restock_needed', 'overstocked'
  message text NOT NULL,
  severity varchar(10) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  is_read boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('low_stock', 'out_of_stock', 'restock_needed', 'overstocked'))
);

-- Commandes de réapprovisionnement
CREATE TABLE IF NOT EXISTS lta_restock_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number varchar(30) UNIQUE NOT NULL,
  supplier varchar(100) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending', -- 'pending', 'ordered', 'shipped', 'received', 'cancelled'
  total_amount decimal(12,2) DEFAULT 0.00,
  order_date timestamptz DEFAULT now(),
  expected_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  notes text,
  created_by uuid,
  created_by_name varchar(100) DEFAULT 'Admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'ordered', 'shipped', 'received', 'cancelled'))
);

-- Détails des commandes
CREATE TABLE IF NOT EXISTS lta_restock_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES lta_restock_orders(id) ON DELETE CASCADE,
  lta_id uuid REFERENCES lta_stock(id) ON DELETE CASCADE,
  quantity_ordered integer NOT NULL,
  quantity_received integer DEFAULT 0,
  unit_cost decimal(10,2) DEFAULT 0.00,
  total_cost decimal(12,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  
  CONSTRAINT valid_ordered_quantity CHECK (quantity_ordered > 0),
  CONSTRAINT valid_received_quantity CHECK (quantity_received >= 0 AND quantity_received <= quantity_ordered)
);

-- Enable Row Level Security
ALTER TABLE lta_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE lta_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lta_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lta_restock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lta_restock_order_items ENABLE ROW LEVEL SECURITY;

-- Policies pour les utilisateurs authentifiés
CREATE POLICY "Users can read all LTA stock"
  ON lta_stock
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert LTA stock"
  ON lta_stock
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update LTA stock"
  ON lta_stock
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete LTA stock"
  ON lta_stock
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies pour les mouvements
CREATE POLICY "Users can read all stock movements"
  ON lta_stock_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock movements"
  ON lta_stock_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies pour les alertes
CREATE POLICY "Users can read all alerts"
  ON lta_alerts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage alerts"
  ON lta_alerts
  FOR ALL
  TO authenticated
  USING (true);

-- Policies pour les commandes
CREATE POLICY "Users can read all restock orders"
  ON lta_restock_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage restock orders"
  ON lta_restock_orders
  FOR ALL
  TO authenticated
  USING (true);

-- Policies pour les détails de commandes
CREATE POLICY "Users can read all order items"
  ON lta_restock_order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage order items"
  ON lta_restock_order_items
  FOR ALL
  TO authenticated
  USING (true);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_lta_stock_updated_at
  BEFORE UPDATE ON lta_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restock_orders_updated_at
  BEFORE UPDATE ON lta_restock_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer des alertes automatiques
CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer les anciennes alertes résolues pour ce LTA
  DELETE FROM lta_alerts 
  WHERE lta_id = NEW.id 
    AND alert_type IN ('low_stock', 'out_of_stock') 
    AND is_resolved = true;

  -- Vérifier stock épuisé
  IF NEW.available_quantity <= 0 THEN
    INSERT INTO lta_alerts (lta_id, alert_type, message, severity)
    VALUES (
      NEW.id,
      'out_of_stock',
      'Stock épuisé pour LTA ' || NEW.lta_number || ' (' || NEW.airline_name || ')',
      'critical'
    )
    ON CONFLICT DO NOTHING;
  
  -- Vérifier stock bas
  ELSIF NEW.available_quantity <= NEW.minimum_threshold THEN
    INSERT INTO lta_alerts (lta_id, alert_type, message, severity)
    VALUES (
      NEW.id,
      'low_stock',
      'Stock bas pour LTA ' || NEW.lta_number || ' (' || NEW.airline_name || ') - Quantité: ' || NEW.available_quantity,
      CASE 
        WHEN NEW.available_quantity <= (NEW.minimum_threshold * 0.5) THEN 'high'
        ELSE 'medium'
      END
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour vérifier les niveaux de stock
CREATE TRIGGER check_stock_levels_trigger
  AFTER INSERT OR UPDATE ON lta_stock
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_levels();

-- Insérer quelques données de test
INSERT INTO lta_stock (lta_number, airline_code, airline_name, stock_type, current_quantity, minimum_threshold, unit_cost, supplier) VALUES
('LTA-AH-001', 'AH', 'Air Algérie', 'physical', 150, 20, 12.50, 'IATA France'),
('LTA-AF-001', 'AF', 'Air France', 'electronic', 500, 50, 8.75, 'Air France Direct'),
('LTA-TU-001', 'TU', 'Tunisair', 'physical', 75, 25, 15.00, 'Tunisair Office'),
('LTA-AT-001', 'AT', 'Royal Air Maroc', 'hybrid', 200, 30, 11.25, 'RAM Distribution'),
('LTA-AH-002', 'AH', 'Air Algérie', 'physical', 5, 20, 12.50, 'IATA France'),
('LTA-AF-002', 'AF', 'Air France', 'electronic', 25, 50, 8.75, 'Air France Direct');

-- Insérer quelques mouvements de test
INSERT INTO lta_stock_movements (lta_id, movement_type, quantity, previous_quantity, new_quantity, reason, user_name) 
SELECT 
  id,
  'in',
  current_quantity,
  0,
  current_quantity,
  'Stock initial',
  'Système'
FROM lta_stock;