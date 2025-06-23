export default function useNoProducts({ refreshing, products }) {
    return !refreshing && products.length === 0;
  }
  