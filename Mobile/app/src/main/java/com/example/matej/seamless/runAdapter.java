package com.example.matej.seamless;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

/**
 * Created by Matej on 13/07/2016.
 */

class runAdapter extends BaseAdapter {

    Context context;
    String[] dataH;
    String[] dataV;
    private static LayoutInflater inflater = null;


    public runAdapter(Context context, String[][] data) {
        // TODO Auto-generated constructor stub
        this.context = context;
        String[] dataHours=new String[data.length];
        String[] dataValues=new String[data.length];
        for(int i = 0; i< data.length; i++){
            dataHours[i]=data[i][0];
            dataValues[i]=data[i][1];
        }
        this.dataH = dataHours;
        this.dataV = dataValues;
        inflater = (LayoutInflater) context
                .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

    @Override
    public int getCount() {
        // TODO Auto-generated method stub
        return dataH.length;
    }

    @Override
    public Object getItem(int position) {
        // TODO Auto-generated method stub
        return dataH[position];
    }

    @Override
    public long getItemId(int position) {
        // TODO Auto-generated method stub
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        // TODO Auto-generated method stub
        View vi = convertView;
        if (vi == null)
            vi = inflater.inflate(R.layout.row, null);
        TextView text = (TextView) vi.findViewById(R.id.hour);
        text.setText(dataH[position]);
        text = (TextView) vi.findViewById(R.id.value);
        text.setText(dataV[position]);
        return vi;
    }
}
