import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';

/**
 * Shared role‑selection login page.
 * Keeps the visual style of the app (dark navy background, purple accents).
 */
export function LoginSelection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md bg-card border border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild variant="default" className="w-full">
            <Link to="/student/login">Student Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/recruiter/login">Recruiter Login</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
