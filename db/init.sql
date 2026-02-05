-- Initialize students table
CREATE TABLE IF NOT EXISTS student (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER,
  course TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sample data
INSERT INTO student (name, email, age, course)
VALUES
  ('Alice Johnson', 'alice@example.com', 21, 'Computer Science'),
  ('Bob Smith', 'bob@example.com', 22, 'Mathematics')
ON CONFLICT DO NOTHING;
