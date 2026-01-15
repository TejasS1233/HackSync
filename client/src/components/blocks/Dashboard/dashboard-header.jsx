export function DashboardHeader({ title, subtitle }) {
    return (
        <header className="flex items-center gap-4">
            <div className="from-primary to-primary/60 h-10 w-1 rounded-full bg-gradient-to-b" />
            <div className="space-y-0.5">
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                )}
            </div>
        </header>
    )
}
