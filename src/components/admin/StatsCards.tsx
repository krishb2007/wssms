
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar, Target } from "lucide-react";
import { VisitorRegistration } from './types';

interface StatsCardsProps {
  registrations: VisitorRegistration[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ registrations }) => {
  const activeVisits = registrations.filter(r => !r.endtime).length;
  const todayVisits = registrations.filter(r => 
    new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;
  const completedVisits = registrations.filter(r => r.endtime).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-600 to-amber-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-amber-100">Total Visitors</p>
              <p className="text-2xl font-bold text-white">{registrations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-emerald-100">Active Visits</p>
              <p className="text-2xl font-bold text-white">{activeVisits}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-blue-100">Today's Visits</p>
              <p className="text-2xl font-bold text-white">{todayVisits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-slate-100">Completed</p>
              <p className="text-2xl font-bold text-white">{completedVisits}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
