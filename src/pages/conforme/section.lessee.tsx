import { Conforme } from '@/interfaces/requests.interface'

function LesseeSection({ conforme }: { conforme: Conforme }) {
    return (
        <main data-page-block className='text-[0.55rem] grid grid-cols-2'>
            <div className='p-0.5'>
                <p className='text-[0.5rem]'>BUSINESS NAME</p>
                <p className='font-semibold'>{conforme.business_name}</p>
            </div>
            <div className='p-0.5'>
                <p className='text-[0.5rem]'>PRODUCT/BRAND</p>
                <p className='font-semibold'>{conforme.product}</p>
            </div>
            <div className='p-0.5'>
                <p className='text-[0.5rem]'>BUSINESS ADDRESS</p>
                <p className='font-semibold'>{conforme.business_address}</p>
            </div>
            <div className='p-0.5'>
                <p className='text-[0.5rem]'>BILLING ADDRESS</p>
                <p className='font-semibold'>{conforme.billing_address}</p>
            </div>
            <div className='p-0.5'>
                <p className='text-[0.5rem]'>AUTHORIZED SIGNATORY</p>
                <p className='font-semibold'>{conforme.authorized_signatory}</p>
            </div>
            <div className='p-0.5'>
                <p className='text-[0.5rem]'>POSITION</p>
                <p className='font-semibold'>{conforme.position}</p>
            </div>
        </main>
    )
}

export default LesseeSection