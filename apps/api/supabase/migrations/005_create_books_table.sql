-- Create books table for storing book catalog
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  author VARCHAR(300) NOT NULL,
  isbn VARCHAR(20),
  description TEXT,
  genre VARCHAR(100),
  publication_year INTEGER,
  page_count INTEGER,
  publisher VARCHAR(200),
  language VARCHAR(50) DEFAULT 'en',
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast lookups and sorting
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_publication_year ON books(publication_year);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- Full-text search index for title and author
CREATE INDEX idx_books_search ON books USING gin(to_tsvector('english', title || ' ' || author));

-- Enable Row Level Security (books are public for now)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read books (public catalog)
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete books (admin operations)
CREATE POLICY "Service role can manage books"
  ON books
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to update updated_at on every update
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some sample books for testing
INSERT INTO books (title, author, description, genre, publication_year, page_count, isbn) VALUES
  (
    'Atomic Habits',
    'James Clear',
    'An Easy & Proven Way to Build Good Habits & Break Bad Ones. A groundbreaking book that shows how tiny changes can lead to remarkable results.',
    'Self-Help',
    2018,
    320,
    '9780735211292'
  ),
  (
    'Deep Work',
    'Cal Newport',
    'Rules for Focused Success in a Distracted World. Learn how to focus without distraction on cognitively demanding tasks.',
    'Productivity',
    2016,
    296,
    '9781455586691'
  ),
  (
    'Thinking, Fast and Slow',
    'Daniel Kahneman',
    'A groundbreaking tour of the mind explaining the two systems that drive the way we think.',
    'Psychology',
    2011,
    499,
    '9780374533557'
  ),
  (
    'The Lean Startup',
    'Eric Ries',
    'How Today''s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.',
    'Business',
    2011,
    336,
    '9780307887894'
  ),
  (
    'Sapiens',
    'Yuval Noah Harari',
    'A Brief History of Humankind. From the origins of Homo sapiens to the present day.',
    'History',
    2011,
    443,
    '9780062316097'
  ),
  (
    'The Power of Habit',
    'Charles Duhigg',
    'Why We Do What We Do in Life and Business. Explores the science behind habit creation and reformation.',
    'Psychology',
    2012,
    371,
    '9780812981605'
  ),
  (
    'Influence',
    'Robert B. Cialdini',
    'The Psychology of Persuasion. Six universal principles of influence and how to use them ethically.',
    'Psychology',
    1984,
    320,
    '9780061241895'
  ),
  (
    'Start With Why',
    'Simon Sinek',
    'How Great Leaders Inspire Everyone to Take Action. Discover the power of starting with purpose.',
    'Leadership',
    2009,
    256,
    '9781591846444'
  ),
  (
    'Zero to One',
    'Peter Thiel',
    'Notes on Startups, or How to Build the Future. A blueprint for creating innovative companies.',
    'Business',
    2014,
    224,
    '9780804139298'
  ),
  (
    'The 7 Habits of Highly Effective People',
    'Stephen R. Covey',
    'Powerful Lessons in Personal Change. A holistic approach to effectiveness in all areas of life.',
    'Self-Help',
    1989,
    381,
    '9780743269513'
  ),
  (
    'Mindset',
    'Carol S. Dweck',
    'The New Psychology of Success. How a growth mindset can help you achieve your potential.',
    'Psychology',
    2006,
    320,
    '9780345472328'
  ),
  (
    'The 4-Hour Workweek',
    'Timothy Ferriss',
    'Escape 9-5, Live Anywhere, and Join the New Rich. A blueprint for lifestyle design.',
    'Business',
    2007,
    416,
    '9780307465351'
  ),
  (
    'Educated',
    'Tara Westover',
    'A Memoir. A powerful story of self-invention and the pursuit of knowledge.',
    'Memoir',
    2018,
    334,
    '9780399590504'
  ),
  (
    'Quiet',
    'Susan Cain',
    'The Power of Introverts in a World That Can''t Stop Talking. Understanding introversion and its strengths.',
    'Psychology',
    2012,
    333,
    '9780307352156'
  ),
  (
    'Daring Greatly',
    'Brené Brown',
    'How the Courage to Be Vulnerable Transforms the Way We Live, Love, Parent, and Lead.',
    'Self-Help',
    2012,
    320,
    '9781592408412'
  )
ON CONFLICT (id) DO NOTHING;

