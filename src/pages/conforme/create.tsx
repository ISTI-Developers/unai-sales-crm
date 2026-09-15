import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { LEDBoardConfigured } from '@/data/LEDBoards';
import { useClients } from '@/hooks/useClients';
import { useInsertRequest, useSingleRequest } from '@/hooks/useRequests';
import { useSites } from '@/hooks/useSites';
import { Cart, CartDetails, NewCart } from '@/interfaces/requests.interface';
import { formatAmount, formatDateRange } from '@/lib/format';
import { cn, getAddOnTotal, getTotalDaily, getTotalGivenRate, getTotalSiteSRP } from '@/lib/utils';
import { useAuth } from '@/providers/auth.provider';
import { addDays, differenceInCalendarDays, differenceInCalendarMonths, format } from 'date-fns';
import { ChevronLeft, Hourglass, PlusIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
import ClientContainer from './client.create';
import SitesPicker from './sites-picker.conforme';
import { SitePreview } from '@/interfaces/sites.interface';
import SitesTabs from './sites.create';
import LedPicker from './led-picker';
import AddOnItem from './addOnItem.create';
import { Textarea } from '@/components/ui/textarea';

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
    leds: [],
    special_term: "",
    add_ons: [],
  });

  const addAddOns = () => {
    setCart(prev => ({
      ...prev,
      add_ons: [
        ...prev.add_ons,
        {
          name: "",
          value: 0,
          qty: 1,
          total: 0,
          is_free: true,
        }
      ]
    }));
  };


  const onSubmit = () => {
    if (!user) return;

    let token = params.get("token");
    if (!token) {
      token = v4();
    }
    const selectedSites = [...cart.sites.map(item => {
      return { ...item, type: "static" as const }
    }), ...cart.leds.map(item => {
      return { ...item, type: "led" as const }
    })]

    const totalSRP = selectedSites.reduce((acc, item) => {
      if (item.type === "static") {
        const difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
        acc += getTotalSiteSRP(item, difference);
      } else {
        acc += getTotalDaily(item.is_free ? Number(item.spots_rate) > 0 ? Number(item.spots_rate) : Number(item.srp) : Number(item.srp), item.date.to, item.date.from) * item.spots_count
      }
      return acc;
    }, 0)
    const totalPackageRate = selectedSites.reduce((acc, item) => {
      const packageRate = Number(item.package_rate);
      if (item.type === "static") {
        const difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
        acc += getTotalGivenRate(packageRate * difference, item);
      } else {
        if (item.is_free) {
          acc += 0;
        } else {
          if (packageRate > 0) {
            acc += packageRate;
          } else {
            const contractRate = item.spots_count * Number(item.spots_rate)
            acc += getTotalDaily(contractRate, item.date.to, item.date.from)
          }
        }
      }
      return acc;
    }, 0)
    const globalFreeAddOns = cart.add_ons.reduce((acc, item) => {
      if (item.is_free) {
        acc += item.total;
      }
      return acc
    }, 0)

    const globalPaidAddOns = cart.add_ons.reduce((acc, item) => {
      if (!item.is_free) {
        acc += item.total;
      }
      return acc
    }, 0)

    const freeSitesAndLEDs = selectedSites.reduce((acc, item) => {
      if (item.type === 'led') {
        if (item.is_free) {
          const contractAmount = getTotalDaily(Number(item.spots_rate) > 0 ? Number(item.spots_rate) : Number(item.srp), item.date.to, item.date.from) * item.spots_count
          acc += contractAmount
        }
      } else {
        if (item.package_rate === "0") {
          const difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
          acc += getTotalSiteSRP(item, difference);
        }
      }
      return acc;
    }, 0)
    const siteAddOns = cart.sites.reduce((acc, item) => {
      const total = getAddOnTotal(item);
      return acc += total;
    }, 0)

    const totalAddOns = globalFreeAddOns + siteAddOns + freeSitesAndLEDs;

    const totalPackageRateWithPaidAddOns = totalPackageRate + globalPaidAddOns;
    const totalNetAmount = totalPackageRateWithPaidAddOns - totalAddOns;
    const totals = {
      package_rate_total: totalPackageRateWithPaidAddOns,
      srp_total: totalSRP,
      net_total: totalNetAmount,
      add_ons_total: totalAddOns,
    }
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
            offered_rate: Number(item.offered_rate),
            installation: item.installation,
            material: item.material,
            add_on_total: addOnTotal,
            net_amount: Number(item.package_rate) - addOnTotal
          }
        }),
        leds: cart.leds.map(item => {
          return {
            ID: item.site.ID,
            from: format(item.date.from, "yyyy-MM-dd"),
            to: format(item.date.to, "yyyy-MM-dd"),
            srp: Number(item.spots_rate),
            spots_count: item.spots_count,
            package_rate: Number(item.package_rate),
            offered_rate: Number(item.offered_rate),
            is_free: item.is_free,
            net_amount: 0,
            details: item.site
          }
        }),
        special_term: cart.special_term.trim(),
        add_ons: cart.add_ons,
      },
      ...totals
    }

    console.log(newCart);

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

        if (!siteDetail) {
          throw new Error("Site not found.");
        }

        const sitePreview: SitePreview = {
          ID: siteDetail.ID,
          site_code: siteDetail.site_code,
          address: siteDetail.address,
          board_facing: siteDetail.board_facing,
          price: siteDetail.price,
          size: siteDetail.size,
          region: siteDetail.region
        }

        return {
          installation: site.installation,
          material: site.material,
          site: sitePreview,
          date: {
            from: new Date(site.from),
            to: new Date(site.to),
          },
          package_rate: String(site.package_rate),
          offered_rate: String(site.offered_rate),
          srp: String(site.srp)
        }
      }),
      leds: details.leds.map(led => {
        return {
          site: led.details,
          date: {
            from: new Date(led.from),
            to: new Date(led.to),
          },
          package_rate: String(led.package_rate),
          offered_rate: String(led.offered_rate),
          spots_count: led.spots_count,
          spots_rate: String(led.srp),
          srp: String(led.srp),
          is_free: led.is_free,
        }
      }),
      special_term: details.special_term,
      add_ons: details.add_ons ?? [],
    })

    initialized.current = true;
  }, [clients, clientsLoading, data, isLoading, sites, sitesLoading]);

  const isIncomplete = !cart.client || cart.sites.some(item => !item.site.ID);
  const showLoader = isLoading || clientsLoading || sitesLoading;

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
        <div className='grid lg:grid-cols-2 gap-4'>
          <ClientContainer cart={cart} setCart={setCart} isLoading={showLoader} />
          <section className='border rounded-xl flex flex-col gap-4'>
            <div className='flex items-center justify-between p-3 border-b'>
              <div>
                <Label className='font-bold'>Notes/Special Terms</Label>
              </div>
            </div>
            <div className='p-4 pt-0'>
              <Textarea value={cart.special_term} className='resize-none h-[5lh] w-full' placeholder='Enter client special instructions, terms, negotiations here.' onChange={(e) => setCart((prev) => ({
                ...prev,
                special_term: e.target.value
              }))} />
            </div>
          </section >
        </div>
        {
          showLoader ?
            <Skeleton className='w-full h-[300px]' /> :
            <>
              <section className='flex flex-col border rounded-xl overflow-hidden'>
                <div className='flex items-center justify-between p-3 border-b'>
                  <div>
                    <Label className='font-bold'>Sites</Label>
                    <p className='text-zinc-500 text-xs'>Leave the Monthly Rate or Spots Rate to 0 to set the site as free</p>
                  </div>
                  {(cart.sites.length > 0 || cart.leds.length > 0) &&
                    <>
                      <div className='space-x-4'>
                        <SitesPicker cartSites={cart.sites} setCart={setCart} />
                        <LedPicker cartLEDs={cart.leds} setCart={setCart} />
                      </div>
                    </>
                  }
                </div>
                {cart.sites.length > 0 || cart.leds.length > 0 ?
                  <>
                    <SitesTabs cart={cart} setCart={setCart} />
                    {/* {cart.sites.map((item, index) => {
                    return <SiteItem key={index} item={item} index={index} setCart={setCart} cart={cart} />
                    })} */}
                  </> :
                  <div className='p-4'>
                    <div className='flex w-full items-center justify-center rounded-lg gap-4 border border-dashed p-4 py-6'>
                      <SitesPicker cartSites={cart.sites} setCart={setCart} />
                      <LedPicker cartLEDs={cart.leds} setCart={setCart} />
                    </div>
                  </div>
                }
              </section>
              <section className="rounded-lg border">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <Label className="font-semibold">
                      Add Ons
                    </Label>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Optional items included in the package
                    </p>
                  </div>

                  {cart.add_ons.length > 0 && <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={addAddOns}
                  >
                    <PlusIcon />
                    Add Row
                  </Button>}
                </div>

                {/* Content */}
                <div className="p-4">
                  {cart.add_ons.length === 0 ? (
                    <button
                      type="button"
                      onClick={addAddOns}
                      className="
                    flex w-full items-center justify-center
                    rounded-md border border-dashed
                    px-4 py-6
                    text-sm text-muted-foreground
                    transition-colors
                    hover:border-foreground/30
                    hover:bg-muted/30
                    hover:text-foreground
                "
                    >
                      <PlusIcon className="mr-2 size-4" />
                      Add add-on
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {/* Table header */}
                      <div
                        className="
                        grid
                        grid-cols-[1.5fr_1fr_1fr_1fr_auto_auto]
                        items-center
                        gap-4
                        px-2
                        text-xs
                        font-medium
                        text-muted-foreground
                    "
                      >
                        <span>Name</span>
                        <span>Value</span>
                        <span>Quantity</span>
                        <span>Total</span>
                        <span>Free</span>
                        <span className="w-8" />
                      </div>

                      {cart.add_ons.map((item, index) => (
                        <AddOnItem
                          key={index}
                          index={index}
                          item={item}
                          setCart={setCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
              {/* 
              <Label className='whitespace-nowrap'>Material Cost</Label>
              <InputNumber value={cart.material_cost} groupClassName='w-fit' onChange={(e) => setCart(prev => {
                return {
                  ...prev,
                  material_cost: Number(e.target.value)
                }
              })} />

             */}
              <footer className='flex flex-col items-end gap-4'>
                <TotalRates cart={cart} />
                <Button disabled={isIncomplete} onClick={onSubmit} variant="outline" className='bg-main-100 text-white hover:bg-main-400 hover:text-white'>Submit Request</Button>
              </footer>
            </>
        }
      </main >
    </div >
  )
}

export const TotalRates = ({ cart }: { cart: Cart }) => {

  const selectedSites = useMemo(() => {
    return [...cart.sites.map(item => {
      return { ...item, type: "static" as const }
    }), ...cart.leds.map(item => {
      return { ...item, type: "led" as const }
    })];
  }, [cart.leds, cart.sites])

  const totalSRP = selectedSites.reduce((acc, item) => {
    if (item.type === "static") {
      const difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
      acc += getTotalSiteSRP(item, difference);
    } else {
      acc += getTotalDaily(item.is_free ? Number(item.spots_rate) > 0 ? Number(item.spots_rate) : Number(item.srp) : Number(item.srp), item.date.to, item.date.from) * item.spots_count
    }
    return acc;
  }, 0)
  const totalPackageRate = selectedSites.reduce((acc, item) => {
    const packageRate = Number(item.package_rate);
    if (item.type === "static") {
      const difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
      acc += getTotalGivenRate(packageRate * difference, item);
    } else {
      if (item.is_free) {
        acc += 0;
      } else {
        if (packageRate > 0) {
          acc += packageRate;
        } else {
          const contractRate = item.spots_count * Number(item.spots_rate)
          acc += getTotalDaily(contractRate, item.date.to, item.date.from)
        }
      }
    }
    return acc;
  }, 0)
  const globalFreeAddOns = cart.add_ons.reduce((acc, item) => {
    if (item.is_free) {
      acc += item.total;
    }
    return acc
  }, 0)

  const globalPaidAddOns = cart.add_ons.reduce((acc, item) => {
    if (!item.is_free) {
      acc += item.total;
    }
    return acc
  }, 0)

  const freeSitesAndLEDs = selectedSites.reduce((acc, item) => {
    if (item.type === 'led') {
      if (item.is_free) {
        const contractAmount = getTotalDaily(Number(item.spots_rate) > 0 ? Number(item.spots_rate) : Number(item.srp), item.date.to, item.date.from) * item.spots_count
        acc += contractAmount
      }
    } else {
      if (item.package_rate === "0") {
        const difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
        acc += getTotalSiteSRP(item, difference);
      }
    }
    return acc;
  }, 0)
  const siteAddOns = cart.sites.reduce((acc, item) => {
    const total = getAddOnTotal(item);
    return acc += total;
  }, 0)

  const totalAddOns = globalFreeAddOns + siteAddOns + freeSitesAndLEDs;

  const totalPackageRateWithPaidAddOns = totalPackageRate + globalPaidAddOns;
  const totalNetAmount = totalPackageRateWithPaidAddOns - totalAddOns;
  const margin = totalNetAmount - totalSRP;
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 w-full">
      <div>
        <h3 className="font-semibold">Package Summary</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 text-xs">Total SRP</span>
          <span>{formatAmount(totalSRP)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-zinc-500 text-xs">Total Package Rate</span>
          <span>{formatAmount(totalPackageRateWithPaidAddOns)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-zinc-500 text-xs">Total Add-ons & Free Sites/LEDs Value</span>
          <span className="font-medium">
            -{formatAmount(totalAddOns)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Grand Total</span>
          <span className="text-xl font-bold">
            {formatAmount(totalNetAmount)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold mr-auto">Margin</span>
        <Badge className={cn("flex items-center gap-1 px-3 pl-2", margin >= 0
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100"
          : "bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200")}>
          {margin >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {formatAmount(margin)}
        </Badge>
      </div>
    </div >
  );
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