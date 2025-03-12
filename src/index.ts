import lib from './lib';
const kmField = lib;

export const useField = () => {
  return {
    price: lib.fields,
  };
};

export const usePriceField = () => {
  return lib.fields.price.use();
};

export default kmField;
