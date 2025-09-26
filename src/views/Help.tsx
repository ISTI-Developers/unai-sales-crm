import LRTLegend from '@/components/assets/legend.lrt';
import EDSA from '@/components/assets/stations/edsa';
import GilPuyat from '@/components/assets/stations/gil_puyat';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import Container from '@/misc/Container'
import { ZoomIn, ZoomOut } from 'lucide-react';
import { MouseEventHandler, useState } from 'react';

export interface Station {
  pos: { x: number, y: number },
  scale: number;
  dragging: boolean;
  onAssetClick: MouseEventHandler<SVGPathElement>,
  handleMouseDown: (e: React.MouseEvent<Element, MouseEvent>) => void
}

const Help = () => {
  const [pos, setPos] = useState({ x: -700, y: -400 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.4)
  const [open, setOpen] = useState(false);
  const [assetID, setAssetID] = useState("");
  const [activeStation, setActiveStation] = useState("edsa")

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // stop the page from scrolling
    const zoomIntensity = 0.075;

    if (e.deltaY < 0) {
      // scroll up → zoom in
      setScale(prev => Math.min(prev + zoomIntensity, 5)); // max zoom 5x
    } else {
      // scroll down → zoom out
      setScale(prev => Math.max(prev - zoomIntensity, 0.2)); // min zoom 0.5x
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const onAssetClick: MouseEventHandler<SVGPathElement> = (e) => {
    setAssetID(e.currentTarget.id);
    setOpen(true);
  }
  return (
    <Container>
      <h1>BUENDIA LRT 1</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <div onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className='relative w-full h-full overflow-hidden border'>
          <LRTLegend activeStation={activeStation} setActiveStation={setActiveStation} />
          <div id='controls' className='flex gap-2 p-4 absolute top-0 right-0 z-10'>
            <Button variant="outline" size="icon" onClick={() => setScale(prev => prev > 0.3 ? prev -= 0.1 : 0.2)}><ZoomOut /></Button>
            <Slider value={[scale]} min={0.2} max={5} step={0.1} className='w-[100px]' onValueChange={([value]) => setScale(value)} />
            <Button variant="outline" size="icon" onClick={() => setScale(prev => prev += 0.125)}><ZoomIn /></Button>
          </div>
          {activeStation === "edsa" ?
            <EDSA handleMouseDown={handleMouseDown} pos={pos} scale={scale} onAssetClick={onAssetClick} dragging={dragging} />
            :
            <GilPuyat handleMouseDown={handleMouseDown} pos={pos} scale={scale} onAssetClick={onAssetClick} dragging={dragging} />
          }
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {assetID}
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Container>
  )
}


export default Help