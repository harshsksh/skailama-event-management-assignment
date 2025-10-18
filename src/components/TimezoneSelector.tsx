'use client';

interface TimezoneSelectorProps {
  selectedTimezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export default function TimezoneSelector({ selectedTimezone, onTimezoneChange }: TimezoneSelectorProps) {
  return (
    <div className="flex items-center space-x-3">
      <label htmlFor="timezone-select" className="text-sm font-semibold text-gray-900">
        Timezone:
      </label>
      <select
        id="timezone-select"
        value={selectedTimezone}
        onChange={(e) => onTimezoneChange(e.target.value)}
        className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 min-w-[200px]"
      >
        {timezones.map((tz) => (
          <option key={tz.value} value={tz.value} className="text-gray-900 bg-white py-2">
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}
