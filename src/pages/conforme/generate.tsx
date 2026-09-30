import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSingleRequest } from '@/hooks/useRequests';
import { useUser } from '@/hooks/useUsers';
import { CartDetails, Conforme, ConformeLED, ConformeSite, defaultPaymentTerms } from '@/interfaces/requests.interface';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import LesseeTab from './lessee.generate';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSitesMap } from '@/hooks/useSites';
import SitesTab from './sites.generate';
import PaymentTab from './payment.generate';
import TermsTab from './terms.generate';
import PagePreview from './page.preview';
import { LEDBoards } from '@/data/LEDBoards';
import LEDsTab from './leds.generate';
import AcknowledgementTab from './acknowledgement.generate';
import { GenerateConformeButton } from './print- button';
import { generateConforme } from '@/lib/print';

function GenerateConforme() {
    const params = useParams();
    const initializedRef = useRef(false);
    const { data, isLoading } = useSingleRequest(params.request_no);
    const sites = useSitesMap();
    // const { user: currentUser } = useAuth();
    const { data: user } = useUser(data?.user_id);
    const [conforme, setConforme] = useState<Conforme>({
        business_name: "",
        business_address: "",
        product: "",
        authorized_signatory: "",
        billing_address: "",
        position: "",
        sites: [],
        leds: [],
        add_ons: [],
        production: {
            material_printing: { internal: true, format: "fixed" },
            installation_and_dismantling: { internal: true }
        },
        terms: defaultPaymentTerms,
        internal_signatory: [],
        internal_signatory_options: {
            layout: "separated",
            use_code_names: false
        },
        external_signatory: []
    })


    useEffect(() => {
        if (!data || !sites || isLoading || !user || initializedRef.current) return;
        const requestDetails = JSON.parse(data.details) as CartDetails;
        setConforme(prev => {
            const siteDetails: ConformeSite[] = requestDetails.sites.map(site => {
                console.log(site);
                const details = sites.get(site.ID);
                return {
                    ID: details!.ID,
                    site_code: details!.site_code,
                    address: details!.address,
                    board_facing: details!.board_facing,
                    size: details!.size,
                    region: details!.region,
                    start: site.from,
                    end: site.to,
                    add_on_total: site.add_on_total,
                    monthly_rate: site.package_rate,
                    offered_rate: site.offered_rate,
                    total_rate: site.net_amount,
                    installation: site.installation,
                    material: site.material,
                }
            })
            const ledDetails: ConformeLED[] = requestDetails.leds.map(led => {
                const ledItem = LEDBoards.find(item => item.ID === led.ID)!;
                return {
                    ID: led.ID,
                    site_code: ledItem.site_code,
                    address: ledItem.address,
                    board_facing: ledItem.board_facing,
                    size: ledItem.size,
                    srp: ledItem.spots_price,
                    spots_price: led.srp,
                    package_rate: led.package_rate,
                    spots_count: led.spots_count,
                    start: led.from,
                    end: led.to,
                    total_rate: led.net_amount,
                    is_free: led.is_free,
                }
            })
            return {
                ...prev,
                business_name: requestDetails.client_name,
                product: requestDetails.brand,
                sites: siteDetails,
                leds: ledDetails,
                add_ons: requestDetails.add_ons,
                internal_signatory: [
                    {
                        name: `${user.first_name} ${user.last_name}`,
                        title: user.role.name,
                        signature: undefined
                    }
                ],
                external_signatory: [
                    {
                        name: "",
                        title: "",
                    }
                ]
            }
        })
        initializedRef.current = true;
    }, [data, sites, isLoading, user])

    if (!data && isLoading) {
        return <>Loading...</>
    }

    if (!data) {
        return <div className="p-4 text-center">
            Sorry, we couldn't locate your approval request. It might be deleted. Please contact the developer.
        </div>
    }


    return (
        <>
            <div>
                <header className="flex flex-col lg:flex-row gap-4 items-start justify-between sticky top-0 bg-white p-4 border-b shadow-sm z-[5] print:hidden">
                    <div className="flex items-center justify-between w-full gap-1">
                        <div>
                            {/* <h1 className="font-semibold">Generate Conforme</h1> */}
                            <p className='font-semibold'>#{data.request_no}</p>
                            <p className="text-sm capitalize">{`${user?.first_name} ${user?.last_name}`}</p>
                        </div>
                    </div>
                    <GenerateConformeButton onGenerate={(options) => generateConforme(data.request_no, conforme, options, user)} />
                </header>
                <main className='grid grid-cols-2 print:block w-full gap-4'>
                    <ScrollArea className='h-[80dvh] print:hidden'>
                        <section className='p-4 pt-0 print:hidden'>
                            <Accordion defaultValue={['lessee', 'site', 'terms', 'sign']} type='multiple'>
                                <AccordionItem value='lessee'>
                                    <AccordionTrigger>Lessee Information</AccordionTrigger>
                                    <AccordionContent className='flex flex-col gap-4'>
                                        <LesseeTab conforme={conforme} setConforme={setConforme} />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value='site'>
                                    <AccordionTrigger>Site Specifications</AccordionTrigger>
                                    <AccordionContent className='space-y-4'>
                                        <SitesTab conforme={conforme} setConforme={setConforme} />
                                        <LEDsTab conforme={conforme} />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value='terms'>
                                    <AccordionTrigger>Terms and Condition</AccordionTrigger>
                                    <AccordionContent className='space-y-4'>
                                        <PaymentTab conforme={conforme} setConforme={setConforme} />
                                        <TermsTab conforme={conforme} setConforme={setConforme} />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value='sign'>
                                    <AccordionTrigger>Acknowledgement</AccordionTrigger>
                                    <AccordionContent>
                                        <AcknowledgementTab owner={user} conforme={conforme} setConforme={setConforme} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>
                    </ScrollArea>
                    <ScrollArea className='h-[80dvh]'>
                        <section className="bg-zinc-200 p-4 flex flex-col gap-4 print:p-0 print:bg-white">
                            <PagePreview conforme={conforme} />
                        </section>
                    </ScrollArea>
                </main>
            </div >
        </>
    )
}

export default GenerateConforme