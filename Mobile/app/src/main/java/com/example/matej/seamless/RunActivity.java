package com.example.matej.seamless;

import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

public class RunActivity extends AppCompatActivity {

    ListView listview;
    ImageButton imageButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.row);

        TextView text = (TextView) findViewById(R.id.value);
        Typeface font = Typeface.createFromAsset(getAssets(), "HVD Fonts - BrixSansMedium.otf");
        text.setTypeface(font);
        text = (TextView) findViewById(R.id.hour);
        text.setTypeface(font);
        text = (TextView) findViewById(R.id.date);
        text.setTypeface(font);

        setContentView(R.layout.activity_run);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        text = (TextView) findViewById(R.id.toolbar_date);
        text.setTypeface(font);
        text = (TextView) findViewById(R.id.toolbar_dot);
        text.setTypeface(font);
        text = (TextView) findViewById(R.id.toolbar_hour);
        text.setTypeface(font);
        listview = (ListView) findViewById(R.id.listview);
        listview.setAdapter(new specialAdapter(this, new String[][]{
                {"23:00", "1.33km"},
                {"22:00", "0.17km"},
                {"21:00", "0.09km"},
                {"20:00", "0.70km"}
                }));
        addListenerOnButton();

        final Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(RunActivity.this,
                        "Sync successful!", Toast.LENGTH_SHORT).show();

            }
        }, 750);
    }

    public void addListenerOnButton() {
        imageButton = (ImageButton) findViewById(R.id.toolbar_button_bg);

        imageButton.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View arg0) {
                Intent intent = new Intent(getApplicationContext(), GlavniActivity.class);
                startActivity(intent);
            }

        });

        imageButton = (ImageButton)findViewById(R.id.toolbar_button_food);
        imageButton.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View arg0) {
                Intent intent = new Intent(getApplicationContext(), MealActivity.class);
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
