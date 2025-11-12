import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BarCard = ({ data, config, dk, nk, title }: { data: any[] | undefined; config: ChartConfig; dk: string; nk: string, title: string }) => {
    return (
        <Card className="p-4 flex flex-col gap-2 justify-between rounded-lg">
            <CardTitle className='font-normal text-sm'>{title}</CardTitle>
            <CardContent className="p-0 ">
                <ChartContainer config={config} className="w-full h-full">
                    <BarChart data={data} accessibilityLayer >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={dk}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            interval={0}
                            tick={(props) => {
                                const { x, y, payload } = props;
                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        dy={0}
                                        textAnchor={(data?.length ?? 0) > 3 ? "end" : "middle"}
                                        fontSize={10}
                                        transform={(data?.length ?? 0) > 3 ? `rotate(-40, ${x}, ${y})` : ``}
                                    >
                                        {payload.value}
                                    </text>
                                );
                            }}
                        />

                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey={nk}>
                            {data?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} radius={6} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>

            </CardContent>
        </Card>
    )
}

export default BarCard