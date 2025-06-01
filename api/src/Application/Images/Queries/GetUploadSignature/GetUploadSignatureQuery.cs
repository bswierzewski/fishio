namespace Fishio.Application.Images.Queries.GetUploadSignature;

public class GetUploadSignatureQuery : IRequest<UploadSignatureResult>
{
    public string? FolderName { get; set; }
    public string? PublicId { get; set; }
}

public class UploadSignatureResult
{
    public string Signature { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string CloudName { get; set; } = string.Empty;
    public long Timestamp { get; set; }
    public string? FolderName { get; set; }
    public string? PublicId { get; set; }
    public string UploadUrl { get; set; } = string.Empty;
}