import { Badge } from "@/components/ui/badge";
import { F1RaceSelector } from "@/components/f1-race-selector";

interface HeaderProps {
    selectedSession: {
        session_name: string;
        location: string;
    } | null;
    driverCount: number;
}

export const Header = ({ selectedSession, driverCount }: HeaderProps) => {
    return (
        <header className="border-b border-zinc-700 bg-zinc-900/50 backdrop-blur">
            <div className="w-full px-3 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Live Session Race View
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm sm:text-base">
                        {selectedSession ? 
                            `${selectedSession.session_name} - ${selectedSession.location}` : 
                            "Watch entire F1 sessions unfold with real-time driver positions"
                        }
                    </p>
                </div>
                <div className="w-full md:w-auto md:shrink-0 flex items-center gap-4">
                    {selectedSession && (
                        <Badge variant="outline" className="text-zinc-300">
                            {driverCount} Drivers
                        </Badge>
                    )}
                    <F1RaceSelector />
                </div>
            </div>
        </header>
    );
};