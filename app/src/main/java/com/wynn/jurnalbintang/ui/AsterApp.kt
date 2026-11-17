package com.wynn.jurnalbintang.ui

import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.*
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.wynn.jurnalbintang.data.*
import kotlinx.coroutines.launch
import java.util.UUID

data class LaunchRequest(val token: String=UUID.randomUUID().toString(),val text: String?=null,val reflection: Boolean=false)
private data class Destination(val route: String,val label: String,val icon: ImageVector)
private val destinations=listOf(
    Destination("notes","Catatan",Icons.Outlined.Description),
    Destination("reflection","Refleksi",Icons.Outlined.AutoAwesome),
    Destination("collections","Koleksi",Icons.Outlined.FolderOpen),
    Destination("settings","Setelan",Icons.Outlined.Tune)
)

@Composable fun AsterApp(vm: AppViewModel,request: LaunchRequest?,onRequestHandled: ()->Unit) {
    val state by vm.state.collectAsStateWithLifecycle()
    val nav=rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val route=entry?.destination?.route ?: "notes"
    val editing=route.startsWith("editor/")
    val snackbar=remember { SnackbarHostState() }
    val scope=rememberCoroutineScope()
    val create: (String,String?,String?)->Unit={ kind,prompt,folder ->
        val id=UUID.randomUUID().toString()
        nav.navigate("editor/${Uri.encode(id)}?kind=$kind&prompt=${Uri.encode(prompt ?: "")}&folder=${Uri.encode(folder ?: "")}")
    }
    val open: (Note)->Unit={nav.navigate("editor/${Uri.encode(it.id)}?kind=${it.kind}&prompt=")}
    val navigate: (String)->Unit={ target -> nav.navigate(target) { popUpTo(nav.graph.findStartDestination().id) { saveState=true };launchSingleTop=true;restoreState=true } }
    LaunchedEffect(vm) { vm.messages.collect { snackbar.showSnackbar(it) } }
    LaunchedEffect(request?.token) {
        request?.let { req ->
            if(!req.text.isNullOrBlank()) {
                // Persist the incoming share before navigation; never place journal content in routes.
                vm.action {
                    val note=Note(body=req.text.take(BackupCodec.MAX_BODY))
                    vm.repository.dao.save(note)
                    open(note)
                }
            } else if(req.reflection) navigate("reflection")
            onRequestHandled()
        }
    }
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val expanded=maxWidth>=600.dp
        val selected=if(route.startsWith("collection/")) "collections" else route
        Scaffold(contentWindowInsets=if(editing) WindowInsets(0) else WindowInsets.safeDrawing,
            snackbarHost={if(!editing) SnackbarHost(snackbar)},
            bottomBar={if(!editing && !expanded) NavigationBar(containerColor=MaterialTheme.colorScheme.surface,tonalElevation=0.dp) {
                destinations.forEach { d -> NavigationBarItem(selected=selected==d.route,onClick={navigate(d.route)},icon={Icon(d.icon,null)},label={Text(d.label)},modifier=Modifier.semantics { contentDescription="Navigasi ${d.label}" }) }
            }}) { padding ->
            Row(Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding)) {
                if(expanded && !editing) NavigationRail(containerColor=MaterialTheme.colorScheme.surface) {
                    Spacer(Modifier.height(24.dp));AsterMark();Spacer(Modifier.height(32.dp))
                    destinations.forEach { d -> NavigationRailItem(selected=selected==d.route,onClick={navigate(d.route)},icon={Icon(d.icon,null)},label={Text(d.label)},modifier=Modifier.semantics { contentDescription="Navigasi ${d.label}" }) }
                }
                NavHost(navController=nav,startDestination="notes",modifier=Modifier.weight(1f),
                    enterTransition={fadeIn(tween(180))},exitTransition={fadeOut(tween(180))},popEnterTransition={fadeIn(tween(180))},popExitTransition={fadeOut(tween(180))}) {
                    composable("notes") {
                        LibraryScreen(state,onSettings={navigate("settings")},onBack={nav.popBackStack()},onOpen=open,onCreate={create(it,null,null)},onSort={vm.settings { it.copy(oldest=!it.oldest) }},onRetry=vm::reload)
                    }
                    composable("reflection") { ReflectionScreen(state,onPrompt={create("reflection",it.id,null)},onFree={create("reflection",null,null)},onOpen=open) }
                    composable("collections") { CollectionsScreen(state,vm) { nav.navigate("collection/${Uri.encode(it)}") } }
                    composable("settings") { SettingsScreen(state,vm) }
                    composable("collection/{collection}",arguments=listOf(navArgument("collection") { type=NavType.StringType })) { back ->
                        val collection=back.arguments?.getString("collection") ?: "all"
                        LibraryScreen(state,collection,onSettings={navigate("settings")},onBack={nav.popBackStack()},onOpen=open,onCreate={kind -> create(kind,null,collection.takeUnless { it in listOf("all","favorites","archive","trash") })},onSort={vm.settings { it.copy(oldest=!it.oldest) }},onRetry=vm::reload)
                    }
                    composable("editor/{id}?kind={kind}&prompt={prompt}&folder={folder}",arguments=listOf(navArgument("id") { type=NavType.StringType },navArgument("kind") { defaultValue="note" },navArgument("prompt") { defaultValue="" },navArgument("folder") { defaultValue="" })) {
                        val editor: EditorViewModel=viewModel(factory=EditorViewModel.factory(vm.repository))
                        EditorScreen(editor,state.folders) { nav.popBackStack() }
                    }
                }
            }
        }
    }
}
