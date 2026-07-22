import React, { InputHTMLAttributes, useEffect, useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import { PhilippinePesoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const InputNumber = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { isMoney?: boolean; groupClassName?: string }>(({ value, onChange, groupClassName, isMoney = true, ...props }, ref) => {
    const [display, setDisplay] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/,/g, "");

        if (!/^\d*\.?\d*$/.test(raw)) return;

        const [integer, decimal] = raw.split(".");

        const formatted =
            integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (decimal !== undefined ? `.${decimal}` : "");

        setDisplay(formatted);

        onChange?.({
            ...e,
            target: {
                ...e.target,
                id: props.id,
                value: raw,
            },
        } as React.ChangeEvent<HTMLInputElement>);
    };

    useEffect(() => {
        if (value == null || value === "") {
            setDisplay("");
            return;
        }

        const raw = String(value).replace(/,/g, "");

        if (!/^\d*\.?\d*$/.test(raw)) return;

        const [integer, decimal] = raw.split(".");

        const formatted =
            integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (decimal !== undefined ? `.${decimal}` : "");

        setDisplay(formatted);
    }, [value]);

    return (
        <InputGroup className={cn('bg-white px-1.5', groupClassName)}>
            {isMoney &&
                <InputGroupAddon className='px-0'>
                    <PhilippinePesoIcon className='size-4' />
                </InputGroupAddon>
            }
            <InputGroupInput
                {...props}
                id={props.id}
                value={display}
                onChange={handleChange}
                inputMode="decimal"
                className='pl-1'
                // placeholder=""
                ref={ref}
            />
        </InputGroup>
    )
})

InputNumber.displayName = "InputNumber";

export default InputNumber