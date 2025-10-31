'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { format } from 'date-fns';
import {
  Select,
  SelectOption,
} from '../ui/select';
import { Session } from '@/models';
import { f1Api } from '@/api/f1Api';
import { useRaceStore } from '@/hooks/useRaceStore';

const YEARS = [2025, 2024, 2023];

// Year Selector Component
function YearSelector({
  selectedYear,
  onYearChange
}: {
  selectedYear: number | null;
  onYearChange: (year: string) => void;
}) {
  return (
    <div className="w-auto">
      <Select
        value={selectedYear?.toString() || ''}
        onValueChange={onYearChange}
        className="h-9 min-w-[110px] border border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800/60"
      >
        <SelectOption value="" disabled>
          Select Year
        </SelectOption>
        {YEARS.map(year => (
          <SelectOption key={year} value={year.toString()}>
            {year}
          </SelectOption>
        ))}
      </Select>
    </div>
  );
}

// Weekend Selector Component
function WeekendSelector({
  selectedMeetingKey,
  onMeetingChange,
  sortedMeetings,
  isLoading,
  sessions
}: {
  selectedMeetingKey: number | null;
  onMeetingChange: (meetingKey: string) => void;
  sortedMeetings: any[];
  isLoading: boolean;
  sessions: Session[] | undefined;
}) {
  return (
    <div className="w-auto">
      <Select
        value={selectedMeetingKey?.toString() || ''}
        onValueChange={onMeetingChange}
        disabled={!sessions || isLoading}
        className="h-9 min-w-[200px] border border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800/60 disabled:opacity-50"
      >
        <SelectOption value="" disabled>
          {isLoading ? 'Loading…' : 'Select Weekend'}
        </SelectOption>
        {sortedMeetings.map((meeting: any) => (
          <SelectOption
            key={meeting.meeting_key}
            value={meeting.meeting_key.toString()}
          >
            {`${meeting.location} - ${format(new Date(meeting.date_start), 'MMM d')}`}
          </SelectOption>
        ))}
      </Select>
    </div>
  );
}

// Session Selector Component
function SessionSelector({
  selectedSession,
  onSessionChange,
  selectedMeetingKey,
  groupedSessions
}: {
  selectedSession: Session | null;
  onSessionChange: (sessionKey: string) => void;
  selectedMeetingKey: number | null;
  groupedSessions: Record<number, any>;
}) {
  return (
    <div className="w-auto basis-full sm:basis-auto">
      <Select
        value={selectedSession?.session_key?.toString() || ''}
        onValueChange={onSessionChange}
        disabled={!selectedMeetingKey}
        className="h-9 min-w-[200px] bg-zinc-900/50 border border-zinc-700 text-zinc-100 hover:bg-zinc-800/60 disabled:opacity-50"
      >
        <SelectOption value="" disabled>
          Select Session
        </SelectOption>
        {selectedMeetingKey &&
          groupedSessions[selectedMeetingKey]?.sessions
            .sort(
              (a: any, b: any) =>
                new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
            )
            .map((session: any) => (
              <SelectOption
                key={session.session_key}
                value={session.session_key.toString()}
              >
                {`${session.session_name} - ${format(new Date(session.date_start), 'EEE HH:mm')}`}
              </SelectOption>
            ))}
      </Select>
    </div>
  );
}

export function F1RaceSelector() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMeetingKey, setSelectedMeetingKey] = useState<number | null>(
    null
  );
  const { selectedSession, setSelectedSession, reset } = useRaceStore();

  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sessions', selectedYear],
    queryFn: () => f1Api.getSessions(selectedYear!),
    enabled: !!selectedYear && selectedYear !== null,
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

    setSelectedYear(parsed);
    setSelectedMeetingKey(null);
    setSelectedSession(null);
    reset();
  };

  const handleMeetingChange = (meetingKey: string) => {
    const parsed = meetingKey === '' ? null : parseInt(meetingKey);
    console.log('here: sessions:', sessions);

    setSelectedMeetingKey(parsed);
    setSelectedSession(null);
  };

  const handleSessionChange = (sessionKey: string) => {
    if (sessionKey === '') return setSelectedSession(null);

    console.log('calling handleSessionChange with sessionKey:', sessionKey);
    const session = sessions?.find(
      s => s.session_key === parseInt(sessionKey)
    );
    setSelectedSession(session ?? null);
  };

  if (error) {
    return <div className="text-sm text-red-400">Failed to load sessions.</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <YearSelector
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
      />

      <WeekendSelector
        selectedMeetingKey={selectedMeetingKey}
        onMeetingChange={handleMeetingChange}
        sortedMeetings={sortedMeetings}
        isLoading={isLoading}
        sessions={sessions}
      />

      <SessionSelector
        selectedSession={selectedSession}
        onSessionChange={handleSessionChange}
        selectedMeetingKey={selectedMeetingKey}
        groupedSessions={groupedSessions}
      />
    </div>
  );
}
