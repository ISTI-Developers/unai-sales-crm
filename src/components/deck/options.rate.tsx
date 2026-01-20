import { useDeck } from "@/providers/deck.provider"
import { Label } from "../ui/label";
import InputNumber from "../ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const RatesGeneratorOption = () => {
    const { selectedOptions, setOptions } = useDeck();


    return (
        <>{selectedOptions.rate_generator!.map(item => {
            return <div key={item.duration}>
                <Label className='text-[0.6rem] uppercase font-semibold'>{`${item.duration} months`}</Label>
                <div className='flex items-center bg-white rounded-md shadow'>
                    <InputNumber min={0} value={item.discount} className='h-7 border-none shadow-none text-end' onChange={(e) => setOptions(prev => {
                        if (!prev) return prev;

                        return {
                            ...prev,
                            rate_generator: prev.rate_generator?.map(adj =>
                                adj.duration === item.duration
                                    ? { ...adj, discount: Number(e.target.value) } // update only one key
                                    : adj
                            )
                        };
                    })} />
                    <Select value={item.type} onValueChange={(value) => setOptions(prev => {
                        if (!prev) return prev;

                        return {
                            ...prev,
                            rate_generator: prev.rate_generator?.map(adj =>
                                adj.duration === item.duration
                                    ? { ...adj, type: value as typeof adj.type, discount: adj.discount > 100 ? 100 : adj.discount } // update only one key
                                    : adj
                            )
                        };
                    })}>
                        <SelectTrigger showIcon={false} className='border-none shadow-none w-fit px-2 pr-3 h-7'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='---'>--</SelectItem>
                            <SelectItem value='%'>%</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        })}</>
    )
}

export default RatesGeneratorOption