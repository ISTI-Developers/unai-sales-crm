import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EraserIcon, FileIcon, UploadIcon, XIcon } from 'lucide-react';
import {
    ChangeEvent,
    PointerEvent,
    useEffect,
    useRef,
    useState,
} from 'react';

interface SignatureInputProps {
    value?: File;
    onChange: (file?: File) => void;
    disabled?: boolean;
}

function SignatureInput({
    value,
    onChange,
    disabled = false,
}: SignatureInputProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawing, setHasDrawing] = useState(false);

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = 180 * dpr;

        canvas.style.width = `${rect.width}px`;
        canvas.style.height = '180px';

        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;
    };
    useEffect(() => {
        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const getPosition = (
        event: PointerEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return { x: 0, y: 0 };
        }

        const rect = canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    };

    const handlePointerDown = (
        event: PointerEvent<HTMLCanvasElement>
    ) => {
        if (disabled) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!ctx) return;

        const { x, y } = getPosition(event);

        canvas?.setPointerCapture(event.pointerId);

        ctx.beginPath();
        ctx.moveTo(x, y);

        setIsDrawing(true);
        setHasDrawing(true);
    };

    const handlePointerMove = (
        event: PointerEvent<HTMLCanvasElement>
    ) => {
        if (!isDrawing || disabled) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!ctx) return;

        const { x, y } = getPosition(event);

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handlePointerUp = () => {
        if (!isDrawing) return;

        setIsDrawing(false);
        saveDrawing();
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        canvas.toBlob(blob => {
            if (!blob) return;

            const file = new File(
                [blob],
                'signature.png',
                {
                    type: 'image/png',
                }
            );

            onChange(file);
        }, 'image/png');
    };

    const clearDrawing = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) return;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        setHasDrawing(false);
        onChange(undefined);
    };

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        onChange(file);
    };

    return (
        <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                    Upload
                </TabsTrigger>
                <TabsTrigger value="draw" disabled>
                    Draw
                </TabsTrigger>
            </TabsList>

            <TabsContent value="draw">
                <div
                    ref={containerRef}
                    className="relative overflow-hidden rounded-md border bg-white"
                >
                    <canvas
                        ref={canvasRef}
                        className="block w-full touch-none cursor-crosshair"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    />

                    {!hasDrawing && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
                            Draw your signature here
                        </div>
                    )}
                </div>

                <div className="mt-2 flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!hasDrawing || disabled}
                        onClick={clearDrawing}
                    >
                        <EraserIcon />
                        Clear
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="upload">
                <div className="flex h-[180px] items-center justify-center rounded-md border border-dashed bg-zinc-50/50">
                    {value ? (
                        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
                            <div className="flex size-8 items-center justify-center rounded-md bg-zinc-100">
                                <FileIcon className="size-4 text-zinc-500" />
                            </div>

                            <div className="min-w-0 max-w-[220px]">
                                <p className="truncate text-xs font-medium text-zinc-700">
                                    {value.name}
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                    Signature uploaded
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => onChange(undefined)}
                                disabled={disabled}
                                className="ml-1 flex size-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:pointer-events-none disabled:opacity-50"
                            >
                                <XIcon className="size-4" />
                                <span className="sr-only">
                                    Remove signature
                                </span>
                            </button>
                        </div>
                    ) : (
                        <label
                            className={`
                    flex h-full w-full cursor-pointer flex-col
                    items-center justify-center gap-2
                    text-sm text-zinc-400
                    transition-colors
                    hover:bg-zinc-100/70
                    ${disabled ? 'pointer-events-none opacity-50' : ''}
                `}
                        >
                            <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100">
                                <UploadIcon className="size-4 text-zinc-500" />
                            </div>

                            <div className="text-center">
                                <p className="text-xs font-medium text-zinc-600">
                                    Upload signature
                                </p>

                                <p className="mt-0.5 text-[11px] text-zinc-400">
                                    PNG or JPG
                                </p>
                            </div>

                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                disabled={disabled}
                                onChange={handleFileChange}
                            />
                        </label>
                    )}
                </div>
            </TabsContent>


        </Tabs>
    );
}

export default SignatureInput;