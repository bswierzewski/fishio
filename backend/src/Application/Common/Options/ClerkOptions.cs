namespace Fishio.Application.Common.Options;

public class ClerkOptions
{
    public const string SectionName = "Clerk";

    public string Authority { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
} 