package com.example.matej.seamless;

import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

public class MealActivity extends AppCompatActivity {

    ListView listview;
    ImageButton imageButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.row);

        /*TextView text = (TextView) findViewById(R.id.value);

        //text.setTypeface(font);
        TextView text = (TextView) findViewById(R.id.hour);
        text.setTypeface(font);
        text = (TextView) findViewById(R.id.date);
        text.setTypeface(font);*/
        Typeface font = Typeface.createFromAsset(getAssets(), "HVD Fonts - BrixSansMedium.otf");
        setContentView(R.layout.activity_meal);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        TextView text = (TextView) findViewById(R.id.toolbar_date);
        text.setTypeface(font);
        text = (TextView) findViewById(R.id.toolbar_dot);
        text.setTypeface(font);
        text = (TextView) findViewById(R.id.toolbar_hour);
        text.setTypeface(font);
        listview = (ListView) findViewById(R.id.listview);
        listview.setAdapter(new specialAdapter(this, new String[][]{
                {"19:35", "60g | 5.5U"},
                {"17:20", "25g | 1.2U"},
                {"12:50", "90g | 11.6U"},
                {"10:45", "0g | 2.8U"}
                }));
        addListenerOnButton();
    }

    public void addListenerOnButton() {

        imageButton = (ImageButton) findViewById(R.id.toolbar_button_runner);

        imageButton.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View arg0) {
                Intent intent = new Intent(getApplicationContext(), RunActivity.class);
                startActivity(intent);
            }

        });

        imageButton = (ImageButton)findViewById(R.id.toolbar_button_bg);
        imageButton.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View arg0) {
                Intent intent = new Intent(getApplicationContext(), GlavniActivity.class);
                startActivity(intent);
            }

        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_run, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
