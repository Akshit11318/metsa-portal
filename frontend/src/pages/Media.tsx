import ThemeToggle from '@/components/ThemeToggle';

export default function Media() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Media</h1>
            <p className="text-sm text-muted-foreground">Manage media files and assets</p>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <p className="text-muted-foreground">Media page content coming soon...</p>
      </main>
    </div>
  );
}
