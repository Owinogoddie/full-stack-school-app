declare module 'jspdf' {
    interface jsPDF {
      internal: {
        getNumberOfPages: () => number;
        pageSize: {
          width: number;
          height: number;
        };
      };
      setPage: (pageNumber: number) => void;
      text: (text: string, x: number, y: number, options?: any) => jsPDF;
      // Add other methods you're using here
    }
  }