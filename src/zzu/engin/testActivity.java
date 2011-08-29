package zzu.engin;

import com.phonegap.DroidGap;

import android.os.Bundle;


public class testActivity extends DroidGap
{
	
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/index.html");
    }
    @Override
	public void onDestroy() {
        super.clearCache();
		super.onDestroy();
	}

  /****************************************************************/  
}
