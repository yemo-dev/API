import { z } from '@hono/zod-openapi'

export const appConfig = {
    port: process.env.PORT || 4000,
    title: 'MiuuAPI Portal',
    description: 'A simple and easy to use API. ⭐️ Star to support our work!',
    version: '1.0.0',
    contact: {
        name: 'Miuu Support',
        url: 'https://github.com/miuubyte',
        email: 'miuudev@gmail.com'
    }
}

/**
 * Configuration for the Scalar Documentation UI
 */
export const scalarConfig = {
    /** Theme of the documentation portal ('none' for custom styling) */
    theme: 'none',
    /** Layout style ('modern' or 'classic') */
    layout: 'modern',
    /** Whether to hide the client code sample button */
    hideClientButton: false,
    /** Whether to show the sidebar navigation */
    showSidebar: true,
    /** Enable developer tools (console/debugger) */
    showDeveloperTools: true,
    /** Enable the top toolbar */
    showToolbar: true,
    /** Source for operation titles ('summary' or 'path') */
    operationTitleSource: 'summary',
    /** Whether to persist authentication state across reloads */
    persistAuth: false,
    /** Enable Scalar telemetry */
    telemetry: true,
    /** Custom external URLs for Scalar services */
    externalUrls: {
        dashboardUrl: 'https://dashboard.scalar.com',
        registryUrl: 'https://registry.scalar.com',
        proxyUrl: 'https://proxy.scalar.com',
        apiBaseUrl: 'https://api.scalar.com'
    },
    /** Allow editing the OpenAPI document from UI */
    isEditable: false,
    /** Show initial loading state */
    isLoading: false,
    /** Hide the models/schemas section */
    hideModels: false,
    /** Format for downloading the documentation ('both', 'json', or 'yaml') */
    documentDownloadType: 'both',
    /** Hide the 'Try It Out' button */
    hideTestRequestButton: false,
    /** Hide the global search feature */
    hideSearch: false,
    /** Show the OpenAPI operation ID */
    showOperationId: false,
    /** Hide the dark mode/light mode switch */
    hideDarkModeToggle: false,
    /** Use default Google fonts */
    withDefaultFonts: true,
    /** Automatically open the first tag in sidebar */
    defaultOpenFirstTag: true,
    /** Automatically expand all tags in sidebar */
    defaultOpenAllTags: false,
    /** Automatically expand all sections in models */
    expandAllModelSections: false,
    /** Automatically expand all response sections */
    expandAllResponses: false,
    /** Order of schema properties ('alpha' or 'required') */
    orderSchemaPropertiesBy: 'alpha',
    /** Always show required properties first */
    orderRequiredPropertiesFirst: true,
    /** Default authentication settings */
    authentication: {
        preferredSecurityScheme: 'ApiKeyAuth'
    },
    /** Custom branding and external community links */
    customBranding: {
        footer: {
            text: 'Powered by miuubyte',
            url: 'https://github.com/miuubyte'
        },
        clientButton: {
            text: 'Discord',
            url: 'https://discord.gg/Gj8CUjCtav',
            icon: 'discord'
        }
    }
}

export const openApiConfig = {
    openapi: '3.1.0',
    info: {
        version: appConfig.version,
        title: appConfig.title,
        description: appConfig.description,
        contact: appConfig.contact
    },
    servers: [],
    tags: [
        { name: 'server', description: 'Server health and statistics' },
        { name: 'auth', description: 'API Key management and authentication' }
    ]
}

export const ErrorSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string()
})

export const UnauthorizedSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string()
})

export const ForbiddenSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string()
})

export const RateLimitSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string(),
    retryAfter: z.number(),
    limit_info: z.object({
        type: z.string(),
        max: z.number()
    })
})
