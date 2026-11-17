package com.wynn.jurnalbintang.ui

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import com.wynn.jurnalbintang.R

val Editorial = FontFamily(Font(R.font.dm_serif_display))
val Jakarta = FontFamily(Font(R.font.plus_jakarta_regular, FontWeight.Normal), Font(R.font.plus_jakarta_semibold, FontWeight.SemiBold))
private val Light = lightColorScheme(
    primary=Color(0xFF2856C5), onPrimary=Color.White,
    primaryContainer=Color(0xFFE5EDFF), onPrimaryContainer=Color(0xFF183D91),
    secondary=Color(0xFF56637B), secondaryContainer=Color(0xFFEDF1FA), onSecondaryContainer=Color(0xFF253B66),
    background=Color(0xFFFAFBFE), onBackground=Color(0xFF172239),
    surface=Color.White, onSurface=Color(0xFF172239),
    surfaceVariant=Color(0xFFF0F3FA), onSurfaceVariant=Color(0xFF56637B),
    surfaceContainer=Color(0xFFF0F3FA), surfaceContainerLow=Color(0xFFF5F7FC),
    surfaceContainerHigh=Color(0xFFE8EDF7), outline=Color(0xFF75839A), outlineVariant=Color(0xFFDFE5F0),
    error=Color(0xFFB3261E), errorContainer=Color(0xFFFCE9E7), onErrorContainer=Color(0xFF681710)
)
private val Dark = darkColorScheme(
    primary=Color(0xFFADC6FF), onPrimary=Color(0xFF082B71),
    primaryContainer=Color(0xFF263E70), onPrimaryContainer=Color(0xFFDBE6FF),
    secondary=Color(0xFFB8C3D7), secondaryContainer=Color(0xFF25324A), onSecondaryContainer=Color(0xFFDCE5F7),
    background=Color(0xFF10141E), onBackground=Color(0xFFE3E8F5),
    surface=Color(0xFF171D2A), onSurface=Color(0xFFE3E8F5),
    surfaceVariant=Color(0xFF202838), onSurfaceVariant=Color(0xFFB8C3D7),
    surfaceContainer=Color(0xFF202838), surfaceContainerLow=Color(0xFF171D2A),
    surfaceContainerHigh=Color(0xFF283247), outline=Color(0xFF8B99AF), outlineVariant=Color(0xFF364257),
    error=Color(0xFFFFB4AB), errorContainer=Color(0xFF63302D), onErrorContainer=Color(0xFFFFDAD6)
)
private val AsterTypography = Typography(
    headlineLarge=TextStyle(fontFamily=Editorial, fontSize=32.sp, lineHeight=40.sp),
    headlineMedium=TextStyle(fontFamily=Editorial, fontSize=28.sp, lineHeight=36.sp),
    headlineSmall=TextStyle(fontFamily=Editorial, fontSize=24.sp, lineHeight=32.sp),
    titleLarge=TextStyle(fontFamily=Jakarta, fontWeight=FontWeight.SemiBold, fontSize=20.sp, lineHeight=28.sp),
    titleMedium=TextStyle(fontFamily=Jakarta, fontWeight=FontWeight.SemiBold, fontSize=16.sp, lineHeight=24.sp),
    titleSmall=TextStyle(fontFamily=Jakarta, fontWeight=FontWeight.SemiBold, fontSize=14.sp, lineHeight=22.sp),
    bodyLarge=TextStyle(fontFamily=Jakarta, fontSize=16.sp, lineHeight=26.sp),
    bodyMedium=TextStyle(fontFamily=Jakarta, fontSize=14.sp, lineHeight=22.sp),
    bodySmall=TextStyle(fontFamily=Jakarta, fontSize=12.sp, lineHeight=18.sp),
    labelLarge=TextStyle(fontFamily=Jakarta, fontWeight=FontWeight.SemiBold, fontSize=14.sp, lineHeight=20.sp),
    labelMedium=TextStyle(fontFamily=Jakarta, fontWeight=FontWeight.SemiBold, fontSize=12.sp, lineHeight=18.sp),
    labelSmall=TextStyle(fontFamily=Jakarta, fontSize=12.sp, lineHeight=16.sp)
)

@Composable
fun AsterTheme(mode: String = "system", content: @Composable () -> Unit) {
    val dark = when(mode) { "dark" -> true; "light" -> false; else -> isSystemInDarkTheme() }
    val view = LocalView.current
    SideEffect {
        (view.context as? Activity)?.window?.let { window ->
            WindowCompat.getInsetsController(window,view).apply {
                isAppearanceLightStatusBars = !dark
                isAppearanceLightNavigationBars = !dark
            }
        }
    }
    MaterialTheme(colorScheme=if(dark) Dark else Light, typography=AsterTypography, content=content)
}
