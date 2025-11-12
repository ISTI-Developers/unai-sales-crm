import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PieCard = ({ data, config, dk, nk, title }: { data: any[] | undefined; config: ChartConfig; dk: string; nk: string, title: string }) => {
    return (
        <Card className="p-4 flex flex-col gap-2 rounded-lg">
            <CardTitle className='font-normal text-sm'>{title}</CardTitle>
            <CardContent className="p-0 ">
                <ChartContainer config={config} className="w-full">
                    <PieChart accessibilityLayer>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={data}
                            dataKey={dk}
                            nameKey={nk}
                            innerRadius={"40%"}
                            outerRadius={"95%"}
                            strokeWidth={5}
                            paddingAngle={5}
                            cornerRadius={5} >
                        </Pie>
                    </PieChart>
                    {/* 🟢 Example placeholder — replace with your actual chart */}
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-2 text-xs w-full">
                    {data?.map((pie) => {
                        return (
                            <div key={pie.status} className="flex gap-2 items-center">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ background: pie.fill }}
                                />
                                <p className="text-[0.65rem]">{pie.status}</p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default PieCard