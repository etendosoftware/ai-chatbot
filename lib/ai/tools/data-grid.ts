import {tool} from 'ai';
import {z} from 'zod';

export const dataGrid = tool({
  description: "View orders in a grid obtained from ERP. Available Columns: id,documentNo,orderDate,grandTotalAmount,posted,processed,grandTotalAmount,orderDate,businessPartner,partnerAddress,priceList,scheduledDeliveryDate,warehouse,documentStatus,grandTotalAmount,currency,documentType,deliveryMethod,shippingCompany,freightCostRule,replacementorder,id,client,processed,salesTransaction,posted,transactionDocument,transactionDocument,id,client,id,processNow,processed,organization,documentNo,transactionDocument,orderDate,businessPartner,partnerAddress,grandTotalAmount,currency,documentStatus,deliveryStatus,invoiceStatus,iscancelled,delivered. Comma separated.\n" +
    '## Criteria examples (always send strings): \n' +
    '- \'{"fieldName":"orderDate","operator":"greaterOrEqual","value":"2025-03-19"}\'\n' +
    '- \'{"fieldName":"organization","operator":"equals","value":"DC206C91AA6A4897B44DA897936E0EC3"}\'\n' +
    '- \'{"fieldName":"orderDate","operator":"greaterOrEqual","value":"2025-03-19"}\'\n' +
    '- \'{"fieldName":"orderDate","operator":"lessOrEqual","value":"2025-03-19"}\'\n' +
    '## Not valid examples: Won\'t use!\n' +
    '- {"fieldName":"orderDate","operator":"equals","value":"2011-03"} - invalid date  ' +
    '## Sort by one of the available columns\n',
  parameters: z.object({
    columns: z.array(z.string()),
    criteria: z.array(z.string()),
    sortBy: z.string(),
  }),
  execute: async ({columns, criteria, sortBy}) => {
    const _selectedProperties = columns.join("%2C")
    let _criteria = '&';
    criteria.forEach((c) => {
      _criteria += 'criteria=' + encodeURIComponent(c) + '&';
    });
    return {
      columns,
      criteria,
      sortBy
    };
  },
});
