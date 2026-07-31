import { useDeck } from "@/providers/deck.provider"
import { Label } from "../ui/label";
import InputNumber from "../ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const RatesGeneratorOption = () => {
    const { selectedOptions, setOptions } = useDeck();

    const { packages } = selectedOptions;
    return (
        <>
            <h1 className="font-bold uppercase text-[0.6rem]">Rate Packages</h1>
            {Object.entries(packages).map(([duration, item]) => {
                return <div key={duration}>
                    <Label className='text-[0.6rem] uppercase font-semibold'>{`${duration} months`}</Label>
                    <div className='flex items-center bg-white rounded-md shadow'>
                        <InputNumber min={0} value={item.value} onChange={(e) => {
                            const value = Number(e.target.value);
                            setOptions(prev => {
                                return {
                                    ...prev,
                                    packages: {
                                        ...prev.packages,
                                        [Number(duration)]: {
                                            ...prev.packages[Number(duration)],
                                            value: value,

                                        }
                                    }
                                }
                            })
                        }} groupClassName="border-none" className='h-7 shadow-none' />
                        <Select value={item.type} onValueChange={(value) => setOptions(prev => {
                            return {
                                ...prev,
                                packages: {
                                    ...prev.packages,
                                    [duration]: {
                                        type: value,
                                        value: 0
                                    }
                                }
                            }
                        })}>
                            <SelectTrigger showIcon={false} className='border-none shadow-none w-fit px-2 pr-3 h-7'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='FLAT'>--</SelectItem>
                                <SelectItem value='PERCENTAGE'>%</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div >
            })}
        </>
        // <>{packages.map(item => {
        //     return <div key={item.duration}>
        //         <Label className='text-[0.6rem] uppercase font-semibold'>{`${item.duration} months`}</Label>
        //         <div className='flex items-center bg-white rounded-md shadow'>
        //             <InputNumber min={0} value={item.discount} groupClassName="border-none" className='h-7 shadow-none' onChange={(e) => setOptions(prev => {
        //                 if (!prev) return prev;

        //                 return {
        //                     ...prev,
        //                     rate_generator: packages.map(adj =>
        //                         adj.duration === item.duration
        //                             ? { ...adj, discount: Number(e.target.value) } // update only one key
        //                             : adj
        //                     )
        //                 };
        //             })} />
        //             <Select value={item.type} onValueChange={(value) => setOptions(prev => {
        //                 if (!prev) return prev;

        //                 return {
        //                     ...prev,
        //                     rate_generator: packages.map(adj =>
        //                         adj.duration === item.duration
        //                             ? { ...adj, type: value as typeof adj.type, discount: adj.discount > 100 ? 100 : adj.discount } // update only one key
        //                             : adj
        //                     )
        //                 };
        //             })}>
        //                 <SelectTrigger showIcon={false} className='border-none shadow-none w-fit px-2 pr-3 h-7'>
        //                     <SelectValue />
        //                 </SelectTrigger>
        //                 <SelectContent>
        //                     <SelectItem value='---'>--</SelectItem>
        //                     <SelectItem value='%'>%</SelectItem>
        //                 </SelectContent>
        //             </Select>
        //         </div>
        //     </div>
        // })}</>
    )
}

export default RatesGeneratorOption