package com.wynn.jurnalbintang

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wynn.jurnalbintang.ui.*

class MainActivity: ComponentActivity() {
    private val model: AppViewModel by viewModels()
    private var launchRequest by mutableStateOf<LaunchRequest?>(null)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        enableEdgeToEdge()
        if(savedInstanceState==null) readIntent(intent)
        setContent {
            val state by model.state.collectAsStateWithLifecycle()
            SideEffect {
                if(state.settings.protectScreen) window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
                else window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            }
            AsterTheme(state.settings.theme) { AsterApp(model,launchRequest) { launchRequest=null } }
        }
    }
    override fun onNewIntent(intent: Intent) { super.onNewIntent(intent);setIntent(intent);readIntent(intent) }
    private fun readIntent(intent: Intent) {
        launchRequest=when {
            intent.action==Intent.ACTION_SEND && intent.type=="text/plain" -> intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()?.take(200_000)?.let { LaunchRequest(text=it) }
            intent.getBooleanExtra("reflection",false) -> LaunchRequest(reflection=true)
            else -> null
        }
    }
}
