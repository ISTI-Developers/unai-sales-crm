import { WidgetData } from '@/misc/dashboardLayoutMap'
import WeeklyReportsCard from './weeklyReportsCard';

const ListCardWidget = ({ widget }: { widget: WidgetData }) => {
    console.log(widget);
    return (
        <WeeklyReportsCard />
    )
}

export default ListCardWidget