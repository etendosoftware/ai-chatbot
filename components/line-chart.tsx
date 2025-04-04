'use client';
import React, {useEffect, useState} from "react"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Session } from 'next-auth';

const groupDataForChart = (data: any[] | undefined, groupField: string, groupCriteria: string, aggregationMethod: string) => {
  // @ts-ignore
  const groupedData = data.reduce((acc, item) => {
    let groupKey;

    // Determinar la clave de agrupación según el campo y el criterio
    if (groupField === 'orderDate') {
      const date = new Date(item[groupField]);
      if (groupCriteria === 'year') {
        groupKey = date.getFullYear().toString(); // Ejemplo: "2011"
      } else if (groupCriteria === 'month') {
        groupKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`; // Ejemplo: "February 2011"
      } else {
        throw new Error('Criterio no soportado para orderDate. Usa "year" o "month".');
      }
    } else {
      // Para otros campos (como documentStatus), agrupar directamente
      groupKey = item[groupField].toString();
    }

    // Inicializar el grupo si no existe
    if (!acc[groupKey]) {
      acc[groupKey] = { value: 0, count: 0 };
    }

    // Agregar según el método de agregación
    if (aggregationMethod === 'sum') {
      acc[groupKey].value += item.grandTotalAmount || 0; // Sumar grandTotalAmount
    } else if (aggregationMethod === 'count') {
      acc[groupKey].count += 1; // Contar ocurrencias
    } else {
      throw new Error('Método de agregación no soportado. Usa "sum" o "count".');
    }

    return acc;
  }, {});

  // Preparar etiquetas y datos para Chart.js
  let labels = Object.keys(groupedData);
  let data_;

  if (groupField === 'orderDate') {
    // Ordenar cronológicamente si es orderDate
    labels = labels.sort((a, b) => {
      if (groupCriteria === 'year') {
        return parseInt(a) - parseInt(b);
      } else {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
      }
    });
  } else {
    // Ordenar alfabéticamente para otros campos
    labels = labels.sort();
  }

  // Extraer los valores según el método de agregación
  if (aggregationMethod === 'sum') {
    data_ = labels.map(label => groupedData[label].value);
  } else {
    data_ = labels.map(label => groupedData[label].count);
  }

  return {
    labels,
    datasets: [
      {
        label: aggregationMethod === 'sum' ? 'Total Amount' : 'Count',
        data: data_,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1,
      },
    ],
  };
};

export const LineChart = ({
                           args
                         }: {
  args?: {
    columns?: string[];
    criteria?: string[];
    sortBy?: string;
  };
}) => {

  const [dat, setDat] = useState<any[]>();
  const [cols, setCols] = useState<any[]>([]);
  const [dataset, setDataset] = useState({labels: [], datasets: []});

  useEffect(() => {
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  }, []);

  const _selectedProperties = args?.columns?.join("%2C")

  let _criteria = '&';
  args?.criteria?.forEach((c) => {
    _criteria += 'criteria=' + encodeURIComponent(c) + '&';
  });
  // get NEXT_PUBLIC_ETENDO_URL
  const etendoUrl = process.env.NEXT_PUBLIC_ETENDO_URL || 'http://localhost:8080/etendo';
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  const access_token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  useEffect(() => {
    fetch(
      etendoUrl + '/org.openbravo.service.datasource/Order',
      {
        headers: {
          accept: '*/*',
          'accept-language': 'es-419,es;q=0.9',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'sec-ch-ua':
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          Authorization: 'Basic ' + btoa('admin:admin'),
        },
        referrer: 'http://localhost:8080/etendo/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body:
          '_noCount=true&%40Order.documentType%40=null&%40Order.deliveryMethod%40=null&%40Order.shippingCompany%40=null&%40Order.freightCostRule%40=null&%40Order.replacementorder%40=null&%40Order.id%40=null&%40Order.client%40=null&%40Order.processed%40=null&%40Order.salesTransaction%40=null&%40Order.posted%40=null&%40Order.organization%40=null&%40Order.orderDate%40=null&%40Order.businessPartner%40=null&%40Order.partnerAddress%40=null&%40Order.priceList%40=null&%40Order.scheduledDeliveryDate%40=null&%40Order.warehouse%40=null&%40Order.documentStatus%40=null&%40Order.grandTotalAmount%40=null&%40Order.currency%40=null&isImplicitFilterApplied=false' +
          '&_selectedProperties=' +
          _selectedProperties +
          '&windowId=143&tabId=186&moduleId=0&_operationType=fetch&_noActiveFilter=true&sendOriginalIDBack=true&_extraProperties=&Constants_FIELDSEPARATOR=%24&_className=OBViewDataSource&Constants_IDENTIFIER=_identifier&operator=and&_constructor=AdvancedCriteria' +
          '&_startRow=0&_endRow=1000' +
          '&_sortBy=' + (args?.sortBy ?? '') +
          _criteria +
          '&_textMatchStyle=substring&_componentId=isc_OBViewGrid_0&_dataSource=isc_OBViewDataSource_0&isc_metaDataPrefix=_&isc_dataFormat=json',
        method: 'POST',
        mode: 'cors',
      },
    )
      .then(response => {
        return response.json();
      })
      .then(data => {
        const dataset_ = groupDataForChart(data.response.data ?? [], 'orderDate', 'year', 'sum')
        setDataset(dataset_);
      });
  }, [_criteria, _selectedProperties, etendoUrl]);
  return (
    <div className={"bg-white"}>
    <Line
      datasetIdKey='id'
      data={dataset}
    />
  </div>
);
};
