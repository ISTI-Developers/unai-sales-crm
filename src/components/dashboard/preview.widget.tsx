import DashboardCard from '../DashboardCard'
import { WidgetData } from '@/misc/dashboardLayoutMap'
import { WidgetCard } from './editor'

const WidgetPreview = ({ widget }: { widget: WidgetData }) => {

    return (
        <section key="preview" className="hidden gap-4 md:flex flex-col items-center">
            <header className="text-sm font-semibold w-full flex flex-col">
                <p>Preview</p>
                <p className='text-[0.65rem] font-normal text-slate-500'>*Data shown is for preview purposes only and may not reflect actual values.</p>
            </header>
            <DashboardCard className="relative max-h-fit space-y-4 lg:max-h-full lg:flex lg:flex-col lg:justify-between min-w-[300px]">
                <WidgetCard widget={widget} isPreview />
            </DashboardCard>
        </section>
    )
}

export default WidgetPreview