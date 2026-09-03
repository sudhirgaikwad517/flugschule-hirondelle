import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  BooleanField,
  ShowButton,
  DeleteButton,
  Show,
  SimpleShowLayout,
  DateField
} from 'react-admin';

export const ServiceOrderList = () => (
  <List sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <DateField source="createdAt" label="Eingegangen am" />
      <TextField source="name" label="Name" />
      <TextField source="ort" label="Ort" />
      <EmailField source="email" label="E-Mail" />
      <TextField source="handy" label="Handy" />
      <BooleanField source="gleitschirm_check" label="GS Check" />
      <BooleanField source="rettung_packen" label="Rettung Packen" />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const ServiceOrderShow = () => (
  <Show>
    <SimpleShowLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Kontakt Daten */}
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h3>Kontaktdaten</h3>
          <DateField source="createdAt" label="Eingegangen am" />
          <TextField source="name" label="Name" />
          <TextField source="strasse" label="Straße" />
          <TextField source="plz" label="PLZ" />
          <TextField source="ort" label="Ort" />
          <TextField source="handy" label="Handynr." />
          <EmailField source="email" label="E-Mail" />
        </div>

        {/* Abgabe */}
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <h3>Abgabe / Sonstiges</h3>
          <TextField source="abgabe" label="Abgabeort" />
          <TextField source="sonstiges" label="Sonstiges" />
        </div>
        
        {/* Gleitschirm */}
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
          <h3>Gleitschirm-Check</h3>
          <BooleanField source="gleitschirm_check" label="Check durchführen?" />
          <TextField source="gs_hersteller" label="Hersteller" />
          <TextField source="gs_typ" label="Typ/Name" />
          <TextField source="gs_farbe" label="Farbe" />
          <TextField source="gs_anmerkung" label="Anmerkung" />
        </div>

        {/* Rettung */}
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
          <h3>Rettung Packen</h3>
          <BooleanField source="rettung_packen" label="Rettung packen?" />
          <TextField source="ret_hersteller" label="Hersteller/Typ" />
          <TextField source="ret_alter" label="Alter der Rettung" />
        </div>

      </div>
    </SimpleShowLayout>
  </Show>
);
