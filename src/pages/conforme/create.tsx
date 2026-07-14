import { Button } from '@/components/ui/button'
import ClientBrandCombobox from '@/components/ui/client-brand-combo-box';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { LEDBoardConfigured } from '@/data/LEDBoards';
import { useClients } from '@/hooks/useClients';
import { useInsertRequest, useSingleRequest } from '@/hooks/useRequests';
import { useSites } from '@/hooks/useSites';
import { Cart, CartDetails, NewCart } from '@/interfaces/requests.interface';
import { Site } from '@/interfaces/sites.interface';
import { formatAmount, formatDateRange } from '@/lib/format';
import { getAddOnTotal, getTotalMonthly } from '@/lib/utils';
import { useAuth } from '@/providers/auth.provider';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { ChevronLeft, Hourglass, InfoIcon, PlusIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 } from 'uuid';
import SiteItem from './siteItem.create';



function CreateConforme() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const { data, isLoading } = useSingleRequest(params.get("no") ?? undefined);
  const { mutate: createRequest } = useInsertRequest();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const navigate = useNavigate();

  const initialized = useRef(false)
  const [cart, setCart] = useState<Cart>({
    client: undefined,
    brand: "",
    sites: [],
    special_term: "",
  });

  const addSite = () => {
    setCart(prev => ({
      ...prev,
      sites: [
        ...prev.sites,
        {
          site: {} as Site, // temporary placeholder
          srp: "0",
          package_rate: "0",
          add_ons: {
            installation: 0,
            material: 0,
            site: undefined
          },
          date: {
            from: new Date(),
            to: addDays(new Date(), 30),
          }
        },
      ],
    }));
  };

  const isIncomplete = !cart.client || cart.sites.some(item => !item.site.ID || item.package_rate === "0");
  const showLoader = isLoading || clientsLoading || sitesLoading;
  const onSubmit = () => {
    if (!user) return;

    let token = params.get("token");
    if (!token) {
      token = v4();
    }
    const totals = cart.sites.reduce(
      (acc, site) => {
        const addOnTotal = getAddOnTotal(site);

        acc.package_rate_total += Number(site.package_rate);
        acc.srp_total += Number(site.srp);
        acc.add_ons_total += addOnTotal;
        acc.net_total += Number(site.package_rate) - addOnTotal;

        return acc;
      },
      {
        package_rate_total: 0,
        srp_total: 0,
        net_total: 0,
        add_ons_total: 0,
      }
    );
    const newCart: NewCart = {
      form_id: 1,
      user_id: Number(user.ID),
      token: token,
      details: {
        client_id: cart.client!.client_id,
        client_name: cart.client!.name,
        brand: cart.brand,
        sites: cart.sites.map(item => {
          const addOnTotal = getAddOnTotal(item);
          return {
            ID: item.site.ID,
            from: format(item.date.from, "yyyy-MM-dd"),
            to: format(item.date.to, "yyyy-MM-dd"),
            srp: Number(item.srp),
            package_rate: Number(item.package_rate),
            add_ons: item.add_ons,
            add_on_total: addOnTotal,
            net_amount: Number(item.package_rate) - addOnTotal
          }
        }),
        special_term: cart.special_term.trim()
      },
      ...totals
    }

    createRequest(newCart, {
      onSuccess: () => {
        navigate("/conforme")
      }
    });
  }

  useEffect(() => {
    if (!data || isLoading || !clients || clientsLoading || sitesLoading || initialized.current) return;

    if (Array.isArray(data)) return;

    const details = JSON.parse(data.details) as CartDetails;

    const client = clients.find(c => c.client_id === details.client_id);

    setCart({
      client: client,
      brand: (details.brand ?? client?.brand) ?? "",
      sites: details.sites.map(site => {
        const siteDetail = sites.find(item => item.ID === site.ID);

        return {
          add_ons: site.add_ons,
          site: siteDetail!,
          date: {
            from: new Date(site.from),
            to: new Date(site.to),
          },
          package_rate: String(site.package_rate),
          srp: String(site.srp)
        }
      }),
      special_term: details.special_term,
    })

    initialized.current = true;
  }, [clients, clientsLoading, data, isLoading, sites, sitesLoading])
  return (
    <div className='space-y-4 p-4'>
      <header className='flex items-center gap-2'>
        <Button variant="link" type="button" onClick={() => {
          navigate(-1)
        }}>
          <ChevronLeft /> Back
        </Button>
        <span>|</span>
        <p className='font-semibold pl-2'>
          Submit Conforme Request
        </p>
      </header>
      <main className='space-y-4'>
        <section className='border rounded-lg p-4 flex flex-col gap-4'>
          <div>
            <Label className='uppercase font-bold'>Client</Label>
            {showLoader ?
              <Skeleton className='w-full h-14' /> :
              <ClientBrandCombobox value={cart.client} onValueChange={(value) => setCart(prev => ({
                ...prev,
                client: value,
                brand: value?.brand ?? "",
              }))} />
            }
          </div>
          <div>
            <Label className='uppercase font-bold'>Brand</Label>
            {showLoader ?
              <Skeleton className='w-full h-14' /> :
              <Input value={cart.brand} onChange={(e) => setCart(prev => ({
                ...prev,
                brand: e.target.value
              }))} />
            }
          </div>
        </section>
        <section className='border rounded-lg p-4 flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <Label className='uppercase font-bold'>Sites Selection</Label>
            <Button variant="outline" className='w-fit h-7 pl-3' onClick={addSite}>
              <PlusIcon />
              <p>Add Site</p>
            </Button>
          </div>
          {showLoader ?
            <Skeleton className='w-full h-40' /> :
            <>
              {cart.sites.length > 0 ?
                <>
                  {cart.sites.map((item, index) => {
                    return <SiteItem key={index} item={item} index={index} setCart={setCart} cart={cart} />
                  })}
                  <TotalRates cart={cart} />
                  <footer className='flex items-end justify-between'>
                    <div className='flex itesm-center gap-2'>
                      <InputGroup>
                        <InputGroupAddon align="block-start">
                          <Label htmlFor='special' className='flex gap-1'>
                            <p className='text-xs'>Special Terms (leave blank if none)</p>
                            <Dialog>
                              <DialogTrigger>
                                <InfoIcon size={14} />
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Special Commercial Terms</DialogTitle>
                                  <DialogDescription className='text-xs'>These terms are not limited and may be supplemented by additional commercial arrangements
                                    as mutually agreed upon by both parties.</DialogDescription>
                                </DialogHeader>
                                <ul className='text-sm flex flex-col gap-2'>
                                  <li>
                                    <strong>Commission for Resellers</strong> - A commission structure or incentive will be provided for authorized resellers based on the agreed terms.
                                  </li>
                                  <li>
                                    <strong>Printing Terms</strong> - Printing services for the advertising materials.
                                  </li>
                                  <li>
                                    <strong>Creative Changes</strong> - Reasonable revisions or modifications to the creative artwork will be accommodated without additional charges, subject to the agreed project scope.
                                  </li>
                                </ul>
                              </DialogContent>
                            </Dialog>
                          </Label>
                        </InputGroupAddon>
                        <InputGroupTextarea className='lg:min-w-[425px]' onChange={(e) => setCart(prev => ({
                          ...prev,
                          special_term: e.target.value
                        }))} />
                      </InputGroup>
                    </div>
                    <Button disabled={isIncomplete} onClick={onSubmit} variant="outline" className='bg-main-100 text-white hover:bg-main-400 hover:text-white'>Submit Request</Button>
                  </footer>
                </> :
                <div className='w-full border-2 border-dashed rounded-lg flex items-center justify-center p-4 bg-zinc-50 text-sm[  ] text-zinc-400'>
                  <p>You haven't selected any sites yet. Add now!</p>
                </div>}
            </>}
        </section>
      </main >
    </div >
  )
}

export const TotalRates = ({ cart }: { cart: Cart }) => {


  const totalSRP = cart.sites.reduce((acc, item) => {
    acc += getTotalMonthly(Number(item.srp), item.date.to, item.date.from)
    return acc;
  }, 0)
  const totalPackageRate = cart.sites.reduce((acc, item) => {
    acc += getTotalMonthly(Number(item.package_rate), item.date.to, item.date.from)
    return acc;
  }, 0)
  const totalAddOns = cart.sites.reduce((acc, item) => {
    const total = getAddOnTotal(item);

    return acc += total;
  }, 0)

  const totalNetAmount = totalPackageRate - totalAddOns;
  const margin = totalNetAmount - totalSRP;
  return <div className='border rounded-lg p-4 flex flex-col gap-2 text-sm'>
    <div className='flex items-center justify-between'>
      <Label>Total SRP</Label>
      <p className='font-semibold'>{formatAmount(totalSRP)}</p>
    </div>
    <div className='flex items-center justify-between'>
      <Label>Total Monthly Rate</Label>
      <p className='font-semibold'>{formatAmount(totalPackageRate)}</p>
    </div>
    <div className='flex items-center justify-between'>
      <Label>Total Add Ons Value</Label>
      <p className='font-semibold text-red-400/80'>-{formatAmount(totalAddOns)}</p>
    </div>
    <hr />
    <div className='flex items-center justify-between'>
      <Label>Grand Total</Label>
      <p className='font-semibold'>{formatAmount(totalNetAmount)}</p>
    </div>
    <div className='flex items-center justify-between'>
      <Label>Margin</Label>
      <p className='font-semibold'>{formatAmount(margin)}</p>
    </div>
  </div>
}


export const LEDContainer = ({ site }: { site: LEDBoardConfigured }) => {
  const days = differenceInCalendarDays(site.to, site.from)
  const spotRate = site.spots_price * site.spots_count * days;
  return <>
    <div>
      <p className='text-xs font-semibold'>{site.site_code} (LED)</p>
      <p className='text-[0.5rem]'>{site.address}</p>
    </div>
    <div className='flex items-center gap-x-1 justify-between'>
      <Hourglass size={14} />
      <p className='text-xs'>{site.spots_count} spots</p>
      <p className='text-xs ml-auto'>{formatAmount(spotRate)}</p>
    </div>
    <div>
      <p className='text-xs font-semibold'>Term Duration</p>
      <p className='text-[0.65rem]'>{formatDateRange(site.from, site.to)} <span className='italic'>({days} days)</span></p>
    </div>
  </>
}

export default CreateConforme