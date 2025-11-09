import React, { ReactNode } from 'react';
import { FormProvider, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import clsx from 'clsx';

export interface FormProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  className?: string;
}

function Form<T extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx('space-y-4', className)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

Form.displayName = 'Form';

export default Form;
