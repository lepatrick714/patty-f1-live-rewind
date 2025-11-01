'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { format } from 'date-fns';
import { CustomSelect, CustomSelectItem } from '../ui/select';
import { Session } from '@/models';
import { f1Api } from '@/api/f1Api';
import { useRaceStore } from '@/hooks/useRaceStore';
import { yearSelectorStorage, raceDaySelectorStorage, sessionSelectorStorage } from '@/utils/userStorage';

const YEARS = [2025, 2024, 2023];

// Component state interface
interface SelectorState {
  selectedYear: number | null;
  selectedMeetingKey: number | null;
  isFirstTime: boolean;
}

// Year Selector Component
function YearSelector({
  selectedYear,
  onYearChange,
  isHighlighted = false,
}: {
  selectedYear: number | null;
  onYearChange: (year: string) => void;
  isHighlighted: boolean;
}) {
  return (
    <div className={`w-full sm:w-auto sm:min-w-[120px] md:min-w-[140px] relative ${isHighlighted ? 'z-10' : ''} group`}>
      <CustomSelect
        value={selectedYear?.toString() || ''}
        onValueChange={onYearChange}
        placeholder="Select Year"
        className={`h-8 w-full border text-zinc-100 hover:bg-zinc-800/60 sm:h-9 relative transition-all duration-300 ${
          isHighlighted 
            ? 'border-blue-400 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 shadow-2xl shadow-blue-500/50 ring-4 ring-blue-400/50 animate-pulse scale-105' 
            : 'border-zinc-700 bg-zinc-900/50'
        }`}
      >
        {YEARS.map(year => (
          <CustomSelectItem key={year} value={year.toString()}>
            {year}
          </CustomSelectItem>
        ))}
      </CustomSelect>
      {isHighlighted && (
        <div className="absolute top-full mt-2 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs sm:text-sm text-blue-300 font-semibold px-2 drop-shadow-lg">
            👆 Choose a year to get started
          </p>
        </div>
      )}
    </div>
  );
}

// Weekend Selector Component
function RaceDaySelector({
  selectedMeetingKey,
  onMeetingChange,
  sortedMeetings,
  isLoading,
  sessions,
  isDisabled,
  isHighlighted = false,
}: {
  selectedMeetingKey: number | null;
  onMeetingChange: (meetingKey: string) => void;
  sortedMeetings: any[];
  isLoading: boolean;
  sessions: Session[] | undefined;
  isDisabled: boolean;
  isHighlighted: boolean;
}) {
  return (
    <div className={`w-full sm:w-auto sm:min-w-[160px] md:min-w-[200px] relative ${isDisabled ? 'opacity-40 pointer-events-none' : ''} group`}>
      <CustomSelect
        value={selectedMeetingKey?.toString() || ''}
        onValueChange={onMeetingChange}
        disabled={!sessions || isLoading || isDisabled}
        placeholder={isLoading ? 'Loading…' : 'Select Race Day'}
        className={`h-8 w-full border text-zinc-100 hover:bg-zinc-800/60 disabled:opacity-50 sm:h-9 transition-all duration-300 ${
          isHighlighted 
            ? 'border-green-400 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 shadow-2xl shadow-green-500/50 ring-4 ring-green-400/50 animate-pulse scale-105' 
            : 'border-zinc-700 bg-zinc-900/50'
        }`}
      >
        {sortedMeetings.map((meeting: any) => (
          <CustomSelectItem
            key={meeting.meeting_key}
            value={meeting.meeting_key.toString()}
          >
            {`${meeting.location} - ${format(new Date(meeting.date_start), 'MMM d')}`}
          </CustomSelectItem>
        ))}
      </CustomSelect>
      {isHighlighted && (
        <div className="absolute top-full mt-2 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs sm:text-sm text-green-300 font-semibold px-2 drop-shadow-lg">
            👆 Now select a race weekend
          </p>
        </div>
      )}
    </div>
  );
}

// Session Selector Component
function SessionSelector({
  selectedSession,
  onSessionChange,
  selectedMeetingKey,
  groupedSessions,
  isDisabled,
  isHighlighted = false,
}: {
  selectedSession: Session | null;
  onSessionChange: (sessionKey: string) => void;
  selectedMeetingKey: number | null;
  groupedSessions: Record<number, any>;
  isDisabled: boolean;
  isHighlighted: boolean;
}) {
  return (
    <div className={`w-full sm:w-auto sm:min-w-[160px] md:min-w-[200px] relative ${isDisabled ? 'opacity-40 pointer-events-none' : ''} group`}>
      <CustomSelect
        value={selectedSession?.session_key?.toString() || ''}
        onValueChange={onSessionChange}
        disabled={!selectedMeetingKey || isDisabled}
        placeholder="Select Session"
        className={`h-8 w-full border text-zinc-100 hover:bg-zinc-800/60 disabled:opacity-50 sm:h-9 transition-all duration-300 ${
          isHighlighted 
            ? 'border-purple-400 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-500/20 shadow-2xl shadow-purple-500/50 ring-4 ring-purple-400/50 animate-pulse scale-105' 
            : 'border-zinc-700 bg-zinc-900/50'
        }`}
      >
        {selectedMeetingKey &&
          groupedSessions[selectedMeetingKey]?.sessions
            .sort(
              (a: any, b: any) =>
                new Date(a.date_start).getTime() -
                new Date(b.date_start).getTime()
            )
            .map((session: any) => (
              <CustomSelectItem
                key={session.session_key}
                value={session.session_key.toString()}
              >
                {`${session.session_name} - ${format(new Date(session.date_start), 'EEE HH:mm')}`}
              </CustomSelectItem>
            ))}
      </CustomSelect>
      {isHighlighted && (
        <div className="absolute top-full mt-2 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs sm:text-sm text-purple-300 font-semibold px-2 drop-shadow-lg">
            👆 Finally, choose a session
          </p>
        </div>
      )}
    </div>
  );
}

export function F1RaceSelector() {
  // Consolidated state - start with safe defaults for SSR
  const [selectorState, setSelectorState] = useState<SelectorState>({
    selectedYear: null,
    selectedMeetingKey: null,
    isFirstTime: false, // Safe default for SSR
  });

  const { selectedSession, setSelectedSession, reset } = useRaceStore();

  // Check localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const isFirstTime = !yearSelectorStorage.hasSeenYearSelector();
    setSelectorState(prev => ({
      ...prev,
      isFirstTime,
    }));
  }, []);

  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sessions', selectorState.selectedYear],
    queryFn: () => f1Api.getSessions(selectorState.selectedYear!),
    enabled: !!selectorState.selectedYear && selectorState.selectedYear !== null,
  });

  // Group sessions by meeting/race weekend
  const groupedSessions = useMemo(() => {
    if (!sessions) return {} as Record<number, any>;
    return sessions.reduce(
      (acc, session: Session) => {
        const key = session.meeting_key;
        if (!acc[key]) {
          acc[key] = {
            meeting_key: key,
            location: session.location,
            country_name: session.country_name,
            circuit_short_name: session.circuit_short_name,
            date_start: session.date_start,
            sessions: [],
          };
        }
        acc[key].sessions.push(session);
        return acc;
      },
      {} as Record<number, any>
    );
  }, [sessions]);

  // Sorted list of meetings (weekends) by date_start ascending
  const sortedMeetings = useMemo(() => {
    return Object.values(groupedSessions)
      .slice()
      .sort(
        (a: any, b: any) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
      );
  }, [groupedSessions]);

  const handleYearChange = (year: string) => {
    const isReset = year === '';
    const parsed = isReset ? null : parseInt(year);

    setSelectorState(prev => ({
      ...prev,
      selectedYear: parsed,
      selectedMeetingKey: null,
    }));
    
    setSelectedSession(null);
    reset();

    // Don't mark as seen here - only when full flow is complete
  };

  const handleMeetingChange = (meetingKey: string) => {
    const parsed = meetingKey === '' ? null : parseInt(meetingKey);
    setSelectorState(prev => ({
      ...prev,
      selectedMeetingKey: parsed,
    }));
    setSelectedSession(null);

    // Don't mark as seen here - only when full flow is complete
  };

  const handleSessionChange = (sessionKey: string) => {
    if (sessionKey === '') return setSelectedSession(null);
    const session = sessions?.find(s => s.session_key === parseInt(sessionKey));
    setSelectedSession(session ?? null);

    // Mark session selector as seen and complete the onboarding flow
    if (session && selectorState.isFirstTime) {
      sessionSelectorStorage.markSessionSelectorSeen();
      yearSelectorStorage.markYearSelectorSeen(); // Mark the full flow as complete
      setSelectorState(prev => ({
        ...prev,
        isFirstTime: false,
      }));
    }
  };

  if (error) {
    return <div className="text-sm text-red-400">Failed to load sessions.</div>;
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center md:gap-3">
      <YearSelector
        selectedYear={selectorState.selectedYear}
        onYearChange={handleYearChange}
        isHighlighted={selectorState.isFirstTime && !selectorState.selectedYear}
      />

      <RaceDaySelector
        selectedMeetingKey={selectorState.selectedMeetingKey}
        onMeetingChange={handleMeetingChange}
        sortedMeetings={sortedMeetings}
        isLoading={isLoading}
        sessions={sessions}
        isDisabled={selectorState.isFirstTime && !selectorState.selectedYear}
        isHighlighted={selectorState.isFirstTime && !!selectorState.selectedYear && !selectorState.selectedMeetingKey}
      />

      <SessionSelector
        selectedSession={selectedSession}
        onSessionChange={handleSessionChange}
        selectedMeetingKey={selectorState.selectedMeetingKey}
        groupedSessions={groupedSessions}
        isDisabled={selectorState.isFirstTime && (!selectorState.selectedYear || !selectorState.selectedMeetingKey)}
        isHighlighted={selectorState.isFirstTime && !!selectorState.selectedYear && !!selectorState.selectedMeetingKey && !selectedSession}
      />
    </div>
  );
}
