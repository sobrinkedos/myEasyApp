import React, { ReactElement } from 'react';
import { useFormContext, Controller, FieldValues, Path } from 'react-hook-form';
import clsx from 'clsx';

export interface FormFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    field: {
      value: any;
      onChange: (value: any) => void;
      onBlur: () => void;
      name: string;
    };
    error?: string;
  }) => ReactElement;
}

function FormField<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required = false,
  className,
  children,
}: FormFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  // Obter erro do campo (suporta campos aninhados)
  const getError = (name: string): string | undefined => {
    const keys = name.split('.');
    let error: any = errors;

    for (const key of keys) {
      if (!error) break;
      error = error[key];
    }

    return error?.message as string | undefined;
  };

  const error = getError(name);

  return (
    <div className={clsx('w-full', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          {label}
          {required && <span className="text-error-DEFAULT ml-1">*</span>}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
          {description}
        </p>
      )}

      {/* Field */}
      <Controller
        name={name}
        control={control}
        render={({ field }) =>
          children({
            field: {
              ...field,
              onChange: (value: any) => {
                // Suportar tanto eventos quanto valores diretos
                const newValue = value?.target ? value.target.value : value;
                field.onChange(newValue);
              },
            },
            error,
          })
        }
      />
    </div>
  );
}

FormField.displayName = 'FormField';

export default FormField;
