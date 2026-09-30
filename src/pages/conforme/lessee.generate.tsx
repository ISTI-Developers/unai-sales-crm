import { Checkbox } from '@/components/ui/checkbox';
import { Input as BaseInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Conforme } from '@/interfaces/requests.interface'
import { Dispatch, SetStateAction, useState } from 'react'

interface LesseeTabProps {
    conforme: Conforme;
    setConforme: Dispatch<SetStateAction<Conforme>>
}
function LesseeTab({ conforme, setConforme }: LesseeTabProps) {
    const [isSameAsBusinessAddress, setIsSameAsBusinessAddress] = useState(false)
    return (
        <>
            <div className='grid lg:grid-cols-2 gap-4'>
                <div>
                    <Label>Business Name</Label>
                    <Input value={conforme.business_name} disabled onValueChange={(value) => setConforme(prev => ({
                        ...prev,
                        business_name: value
                    }))} />
                </div>
                <div>
                    <Label>Product/Brand</Label>
                    <Input value={conforme.product} disabled onValueChange={(value) => setConforme(prev => ({
                        ...prev,
                        product: value
                    }))} />
                </div>
            </div>
            <div>
                <Label>Business Address</Label>
                <Input value={conforme.business_address} onValueChange={(value) => setConforme(prev => ({
                    ...prev,
                    business_address: value
                }))} />
            </div>
            <div>
                <Label>Billing Address</Label>
                <Input disabled={isSameAsBusinessAddress} value={conforme.billing_address} onValueChange={(value) => setConforme(prev => ({
                    ...prev,
                    billing_address: value
                }))} />
                <div className='flex items-center gap-2 pt-1'>
                    <Checkbox id="isSameAsBusinessAddress" checked={isSameAsBusinessAddress} onCheckedChange={(checked) => {
                        setConforme(prev => ({
                            ...prev,
                            billing_address: checked ? prev.business_address : ""
                        }))
                        setIsSameAsBusinessAddress(!!checked)
                    }} />
                    <Label htmlFor='isSameAsBusinessAddress'>Same as Business Address</Label>
                </div>
            </div>
            <div className='grid lg:grid-cols-2 gap-4'>
                <div>
                    <Label>Authorized Signatory</Label>
                    <Input value={conforme.authorized_signatory} onValueChange={(value) => setConforme(prev => ({
                        ...prev,
                        authorized_signatory: value
                    }))} />
                </div>
                <div>
                    <Label>Position</Label>
                    <Input value={conforme.position} onValueChange={(value) => setConforme(prev => ({
                        ...prev,
                        position: value
                    }))} />
                </div>
            </div>
        </>
    )
}

const Input = ({ value, onValueChange, disabled }: { value: string; onValueChange: (value: string) => void; disabled?: boolean }) => {
    return <BaseInput disabled={disabled} value={value} onChange={(e) => onValueChange(e.target.value)} />
}

export default LesseeTab