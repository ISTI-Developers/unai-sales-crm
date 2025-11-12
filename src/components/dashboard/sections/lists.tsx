import { useMemo } from 'react'
import WeeklyReportsCard from '../weeklyReportsCard'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { generateWeeks } from '@/data/reports.columns';
import { getISOWeek } from 'date-fns';
import BookingsCard from '../bookingsCard';
import { useAuth } from '@/providers/auth.provider';
import { cn } from '@/lib/utils';

const Lists = () => {
    const { user } = useAuth();
    const weeks = useMemo(() => generateWeeks(), []);
    const currentWeek = getISOWeek(new Date());


    const access = useMemo(() => {
        if (!user) return { bookings: false, reports: false };

        return { bookings: user.company?.ID === 5, reports: user.role.role_id !== 13 };
    }, [user])

    return (
        <section className={cn(user?.role.role_id === 13 ? "grid w-full" : 'grid grid-cols-2 gap-4')}>
            {access.bookings &&
                <BookingsCard />
            }
            {access.reports &&
                <Card className="p-4 flex flex-col gap-2 justify-between rounded-lg">
                    <CardTitle className='font-normal text-sm'>{weeks[currentWeek - 1]} Activities</CardTitle>
                    <CardContent className='p-0'>
                        <WeeklyReportsCard />
                    </CardContent>
                </Card>
            }
        </section>
    )
}

export default Lists