import { useMemo } from 'react'
import WeeklyReportsCard from '../weeklyReportsCard'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import BookingsCard from '../bookingsCard';
import { useAuth } from '@/providers/auth.provider';
import { cn, generateWeeks } from '@/lib/utils';
import { format } from 'date-fns';

const Lists = () => {
    const { user } = useAuth();
    const weeks = useMemo(() => generateWeeks(), []);
    const week = weeks.find(week => week.isCurrent)!;
    const header = `Wk ${week.isoWeek}`;

    const access = useMemo(() => {
        if (!user) return { bookings: false, reports: false };

        return { bookings: user.company?.ID === 5, reports: user.role.role_id !== 13 };
    }, [user])

    return (
        <section className={cn("grid", user?.role.role_id === 13 ? "w-full" : 'md:grid-cols-2 gap-4')}>
            {access.bookings &&
                <BookingsCard />
            }
            {access.reports &&
                <Card className="p-4 flex flex-col gap-2 justify-between rounded-lg">
                    <CardTitle className='font-semibold text-sm'>{`${header} Activities (${format(week.start, "MMM dd")} - ${format(week.end, "MMM dd")})`}</CardTitle>
                    <CardContent className='p-0'>
                        <WeeklyReportsCard />
                    </CardContent>
                </Card>
            }
        </section>
    )
}

export default Lists