import type { Context } from 'react';
import { useContext } from 'react';

export const createUseContext =
  <T>(context: Context<T | null>) =>
  () => {
    const value = useContext(context);

    if (!value) {
      const displayNameFragment = context.displayName
        ? `: ${context.displayName}`
        : '';

      throw new Error(
        `No value provided. Please provide a value for this context${displayNameFragment}`,
      );
    }

    return value;
  };