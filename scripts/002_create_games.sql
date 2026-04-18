-- Create games table for tic-tac-toe matches
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_x UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_o UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  board JSONB DEFAULT '["","","","","","","","",""]'::jsonb,
  current_turn UUID,
  winner UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Allow users to read games they're part of OR games waiting for players
CREATE POLICY "games_select" ON public.games 
  FOR SELECT USING (
    auth.uid() = player_x 
    OR auth.uid() = player_o 
    OR status = 'waiting'
  );

-- Allow authenticated users to create games (as player_x)
CREATE POLICY "games_insert" ON public.games 
  FOR INSERT WITH CHECK (
    auth.uid() = player_x 
    AND player_o IS NULL 
    AND status = 'waiting'
  );

-- Allow participants to update the game
CREATE POLICY "games_update" ON public.games 
  FOR UPDATE USING (
    auth.uid() = player_x 
    OR auth.uid() = player_o
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for games table
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
