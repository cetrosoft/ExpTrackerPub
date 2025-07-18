-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(50) NOT NULL, -- 'monthly', 'yearly', 'weekly'
  category_id VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create budget_alerts table
CREATE TABLE IF NOT EXISTS budget_alerts (
  id VARCHAR(255) PRIMARY KEY,
  budget_id VARCHAR(255) NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- 'warning', 'exceeded'
  threshold_percentage INTEGER NOT NULL, -- 80, 100, etc.
  is_enabled BOOLEAN DEFAULT TRUE,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

-- Insert some sample budget alerts
INSERT INTO budget_alerts (id, budget_id, alert_type, threshold_percentage, is_enabled, user_id) VALUES
('alert_1', 'budget_1', 'warning', 80, TRUE, NULL),
('alert_2', 'budget_1', 'exceeded', 100, TRUE, NULL);
