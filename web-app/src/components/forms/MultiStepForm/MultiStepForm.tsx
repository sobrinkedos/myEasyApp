import React, { ReactNode, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Button } from '../../ui/Button';

export interface Step {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  validate?: () => Promise<boolean> | boolean;
}

export interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onStepChange,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  // Navegar para próxima etapa
  const handleNext = async () => {
    // Validar etapa atual se houver validação
    if (currentStepData.validate) {
      setIsValidating(true);
      const isValid = await currentStepData.validate();
      setIsValidating(false);

      if (!isValid) {
        return;
      }
    }

    // Marcar etapa como completa
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (isLastStep) {
      onComplete();
    } else {
      setDirection('forward');
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) {
        onStepChange(nextStep);
      }
    }
  };

  // Navegar para etapa anterior
  const handlePrevious = () => {
    if (!isFirstStep) {
      setDirection('backward');
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onStepChange) {
        onStepChange(prevStep);
      }
    }
  };

  // Navegar para etapa específica
  const handleGoToStep = (stepIndex: number) => {
    // Só permite navegar para etapas já completadas ou a próxima
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex - 1)) {
      setDirection(stepIndex > currentStep ? 'forward' : 'backward');
      setCurrentStep(stepIndex);
      if (onStepChange) {
        onStepChange(stepIndex);
      }
    }
  };

  // Calcular progresso
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Variantes de animação
  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Indicador de progresso */}
      <div className="mb-8">
        {/* Barra de progresso */}
        <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-6">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStep;
            const isAccessible = index <= currentStep || completedSteps.includes(index - 1);

            return (
              <button
                key={step.id}
                onClick={() => handleGoToStep(index)}
                disabled={!isAccessible}
                className={clsx(
                  'flex flex-col items-center gap-2 flex-1',
                  'transition-opacity duration-200',
                  {
                    'cursor-pointer': isAccessible,
                    'cursor-not-allowed opacity-50': !isAccessible,
                  }
                )}
              >
                {/* Círculo do step */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full',
                    'flex items-center justify-center',
                    'font-semibold text-sm',
                    'transition-all duration-200',
                    {
                      'bg-primary-500 text-white': isCurrent,
                      'bg-success-DEFAULT text-white': isCompleted && !isCurrent,
                      'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400':
                        !isCurrent && !isCompleted,
                    }
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Título do step */}
                <div className="text-center">
                  <p
                    className={clsx('text-sm font-medium', {
                      'text-primary-500': isCurrent,
                      'text-neutral-900 dark:text-neutral-100': !isCurrent && isAccessible,
                      'text-neutral-400 dark:text-neutral-600': !isAccessible,
                    })}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da etapa */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {currentStepData.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegação */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <Button
          variant="outline"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Anterior
        </Button>

        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Etapa {currentStep + 1} de {steps.length}
        </div>

        <Button
          variant="primary"
          icon={<ChevronRight className="w-4 h-4" />}
          iconPosition="right"
          onClick={handleNext}
          loading={isValidating}
        >
          {isLastStep ? 'Concluir' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
};

MultiStepForm.displayName = 'MultiStepForm';

export default MultiStepForm;
