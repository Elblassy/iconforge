export default function BuilderPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">
            Odoo Icon Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your module icon
          </p>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="rounded-md border border-border p-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Sidebar controls will appear here
            </p>
          </div>
        </div>
      </aside>

      {/* Main canvas area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center space-y-3">
            <div className="w-32 h-32 rounded-2xl bg-primary/20 border-2 border-primary/40 mx-auto flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">O</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Icon canvas will render here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
