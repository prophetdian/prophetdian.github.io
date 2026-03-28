import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SupabaseDemo: React.FC = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Integration Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This page demonstrates that Supabase has been successfully integrated into your project.
              You can now use both your existing MySQL database and Supabase's features.
            </p>
            
            <div className="p-4 bg-secondary rounded-md">
              <h3 className="font-semibold mb-2">Auth Status:</h3>
              <pre className="text-xs overflow-auto max-h-40">
                {session ? JSON.stringify(session.user, null, 2) : 'Not logged in via Supabase'}
              </pre>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.open('https://supabase.com/dashboard/project/rqlucgdeuvpkkrbnvjex', '_blank')}>
                Open Supabase Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDemo;
