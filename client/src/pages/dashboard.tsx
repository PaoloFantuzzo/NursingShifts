import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock, TrendingUp, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Link } from "wouter";
import { type Shift, type Settings, type ShiftTimes } from "@shared/schema";
import { getMonthName, calculateShiftHours } from "@/lib/calendar-utils";

const COLORS = {
  mattina: 'var(--shift-mattina)',
  pomeriggio: 'var(--shift-pomeriggio)', 
  notte: 'var(--shift-notte)',
  ricoveri: 'var(--shift-ricoveri)'
};

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i);

  // Fetch data for the selected year
  const { data: yearlyShifts = [] } = useQuery<Shift[]>({
    queryKey: ['/api/shifts/yearly', selectedYear],
    queryFn: async () => {
      const allShifts: Shift[] = [];
      for (let month = 1; month <= 12; month++) {
        const response = await fetch(`/api/shifts/${selectedYear}/${month}`);
        const monthShifts = await response.json();
        allShifts.push(...monthShifts);
      }
      return allShifts;
    },
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const shiftTimes: ShiftTimes = settings?.shiftTimes 
    ? JSON.parse(settings.shiftTimes)
    : {
        mattina: { start: "07:00", end: "14:00", hours: 7 },
        pomeriggio: { start: "14:00", end: "22:00", hours: 8 },
        notte: { start: "22:00", end: "07:00", hours: 9 },
        ricoveri: { start: "13:00", end: "19:00", hours: 6 }
      };

  const weeklyTargetHours = settings?.weeklyTargetHours || 36;

  // Calculate monthly statistics
  const monthlyStats = Array.from({length: 12}, (_, monthIndex) => {
    const month = monthIndex + 1;
    const monthShifts = yearlyShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === monthIndex;
    });

    const totalHours = monthShifts.reduce((sum, shift) => {
      return sum + calculateShiftHours(shift.type as any, shiftTimes);
    }, 0);

    const shiftCounts = {
      mattina: monthShifts.filter(s => s.type === 'mattina').length,
      pomeriggio: monthShifts.filter(s => s.type === 'pomeriggio').length,
      notte: monthShifts.filter(s => s.type === 'notte').length,
      ricoveri: monthShifts.filter(s => s.type === 'ricoveri').length,
    };

    return {
      month: getMonthName(monthIndex),
      monthNum: month,
      totalHours,
      totalShifts: monthShifts.length,
      ...shiftCounts
    };
  });

  // Calculate yearly totals
  const yearlyTotals = {
    totalHours: yearlyShifts.reduce((sum, shift) => sum + calculateShiftHours(shift.type as any, shiftTimes), 0),
    totalShifts: yearlyShifts.length,
    averageHoursPerMonth: 0,
    targetHours: weeklyTargetHours * 52, // 52 weeks per year
  };
  yearlyTotals.averageHoursPerMonth = yearlyTotals.totalHours / 12;

  // Shift type distribution
  const shiftTypeData = [
    { name: 'Mattina', value: yearlyShifts.filter(s => s.type === 'mattina').length, color: 'var(--shift-mattina)' },
    { name: 'Pomeriggio', value: yearlyShifts.filter(s => s.type === 'pomeriggio').length, color: 'var(--shift-pomeriggio)' },
    { name: 'Notte', value: yearlyShifts.filter(s => s.type === 'notte').length, color: 'var(--shift-notte)' },
    { name: 'Ricoveri', value: yearlyShifts.filter(s => s.type === 'ricoveri').length, color: 'var(--shift-ricoveri)' },
  ].filter(item => item.value > 0);

  const progressPercentage = Math.min((yearlyTotals.totalHours / yearlyTotals.targetHours) * 100, 100);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ios-bg)' }}>
      {/* Header */}
      <div className="bg-[var(--ios-surface)] border-b border-[var(--ios-border)] px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-[var(--ios-text)] hover:bg-[var(--ios-border)]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <h1 className="text-xl font-semibold text-[var(--ios-text)]">
            Dashboard Statistiche
          </h1>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-20 bg-[var(--ios-bg)] border-[var(--ios-border)] text-[var(--ios-text)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--ios-surface)] border-[var(--ios-border)]">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()} className="text-[var(--ios-text)]">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[var(--ios-surface)] border-[var(--ios-border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--ios-text-secondary)] flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Ore Totali {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--ios-text)]">{yearlyTotals.totalHours}h</div>
              <p className="text-xs text-[var(--ios-text-secondary)]">
                Target: {yearlyTotals.targetHours}h
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--ios-surface)] border-[var(--ios-border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--ios-text-secondary)] flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Turni Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--ios-text)]">{yearlyTotals.totalShifts}</div>
              <p className="text-xs text-[var(--ios-text-secondary)]">
                Media: {Math.round(yearlyTotals.averageHoursPerMonth)}h/mese
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="bg-[var(--ios-surface)] border-[var(--ios-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--ios-text)] flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Progresso Annuale
            </CardTitle>
            <CardDescription className="text-[var(--ios-text-secondary)]">
              {progressPercentage.toFixed(1)}% dell'obiettivo annuale raggiunto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-[var(--ios-border)] rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${progressPercentage}%`,
                  backgroundColor: progressPercentage >= 100 ? 'var(--shift-mattina)' : 'var(--shift-pomeriggio)'
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-[var(--ios-text-secondary)]">
              <span>{yearlyTotals.totalHours}h</span>
              <span>{yearlyTotals.targetHours}h</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Hours Chart */}
        <Card className="bg-[var(--ios-surface)] border-[var(--ios-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--ios-text)] flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Ore Mensili {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ios-border)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'var(--ios-text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--ios-border)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--ios-text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--ios-border)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--ios-surface)', 
                    border: '1px solid var(--ios-border)',
                    borderRadius: '8px',
                    color: 'var(--ios-text)'
                  }}
                />
                <Bar dataKey="totalHours" fill="var(--shift-mattina)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Shift Type Distribution */}
        {shiftTypeData.length > 0 && (
          <Card className="bg-[var(--ios-surface)] border-[var(--ios-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--ios-text)]">Distribuzione Tipi di Turno</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={shiftTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {shiftTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--ios-surface)', 
                      border: '1px solid var(--ios-border)',
                      borderRadius: '8px',
                      color: 'var(--ios-text)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {shiftTypeData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-[var(--ios-text)]">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Breakdown Table */}
        <Card className="bg-[var(--ios-surface)] border-[var(--ios-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--ios-text)]">Dettaglio Mensile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyStats.map((month, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-[var(--ios-border)] last:border-b-0">
                  <span className="text-[var(--ios-text)] font-medium">{month.month}</span>
                  <div className="text-right">
                    <div className="text-[var(--ios-text)] font-semibold">{month.totalHours}h</div>
                    <div className="text-xs text-[var(--ios-text-secondary)]">{month.totalShifts} turni</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}