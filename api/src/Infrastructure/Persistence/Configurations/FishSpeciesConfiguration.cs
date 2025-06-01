using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fishio.Infrastructure.Persistence.Configurations;

public class FishSpeciesConfiguration : IEntityTypeConfiguration<FishSpecies>
{
    public void Configure(EntityTypeBuilder<FishSpecies> builder)
    {
        builder.HasKey(fs => fs.Id);

        builder.Property(fs => fs.Name)
            .IsRequired()
            .HasMaxLength(100);
        builder.HasIndex(fs => fs.Name).IsUnique();

        builder.Property(fs => fs.ImageUrl)
            .HasMaxLength(2048);

        builder.HasData(
            // All 33 fish species in alphabetical order (Polish sorting)
            new FishSpecies("Amur biały", "/images/fish/amur-bialy.gif") { Id = 1 },
            new FishSpecies("Boleń", "/images/fish/bolen.gif") { Id = 2 },
            new FishSpecies("Brzana", "/images/fish/brzana.gif") { Id = 3 },
            new FishSpecies("Certa", "/images/fish/certa.gif") { Id = 4 },
            new FishSpecies("Jaź", "/images/fish/jaz.gif") { Id = 5 },
            new FishSpecies("Jelec", "/images/fish/jelec.gif") { Id = 6 },
            new FishSpecies("Karaś", "/images/fish/karas.gif") { Id = 7 },
            new FishSpecies("Karaś srebrzysty", "/images/fish/karas-srebrzysty.gif") { Id = 8 },
            new FishSpecies("Karp", "/images/fish/karp.gif") { Id = 9 },
            new FishSpecies("Kiełb", "/images/fish/kielb.gif") { Id = 10 },
            new FishSpecies("Kleń", "/images/fish/klen.gif") { Id = 11 },
            new FishSpecies("Koza", "/images/fish/koza.gif") { Id = 12 },
            new FishSpecies("Krap", "/images/fish/krap.gif") { Id = 13 },
            new FishSpecies("Leszcz", "/images/fish/leszcz.gif") { Id = 14 },
            new FishSpecies("Lin", "/images/fish/lin.gif") { Id = 15 },
            new FishSpecies("Lipień", "/images/fish/lipien.gif") { Id = 16 },
            new FishSpecies("Miętus", "/images/fish/mietus.gif") { Id = 17 },
            new FishSpecies("Okoń", "/images/fish/okon.gif") { Id = 18 },
            new FishSpecies("Piskorz", "/images/fish/piskorz.gif") { Id = 19 },
            new FishSpecies("Płoć", "/images/fish/ploc.gif") { Id = 20 },
            new FishSpecies("Pstrąg potokowy", "/images/fish/pstrag-potokowy.gif") { Id = 21 },
            new FishSpecies("Pstrąg źródlany", "/images/fish/pstrag-zrodlany.gif") { Id = 22 },
            new FishSpecies("Różanka", "/images/fish/rozanka.gif") { Id = 23 },
            new FishSpecies("Sandacz", "/images/fish/sandacz.gif") { Id = 24 },
            new FishSpecies("Śliż", "/images/fish/sliz.gif") { Id = 25 },
            new FishSpecies("Strzebla potokowa", "/images/fish/strzebla-potokowa.gif") { Id = 26 },
            new FishSpecies("Sum", "/images/fish/sum.gif") { Id = 27 },
            new FishSpecies("Świńka", "/images/fish/swinka.gif") { Id = 28 },
            new FishSpecies("Szczupak", "/images/fish/szczupak.gif") { Id = 29 },
            new FishSpecies("Tołpyga biała", "/images/fish/tolpyga-biala.gif") { Id = 30 },
            new FishSpecies("Ukleja", "/images/fish/ukleja.gif") { Id = 31 },
            new FishSpecies("Węgorz europejski", "/images/fish/wegorz-europejski.gif") { Id = 32 },
            new FishSpecies("Wzdręga", "/images/fish/wzdrega.gif") { Id = 33 }
        );
    }
}
