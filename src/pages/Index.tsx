import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/9f5c7d34-8488-4f7c-adf7-6655f9fc730c/files/84ef75ce-b895-4d0c-8285-5f28c468a092.jpg';

const PRICE = 16666;

const ORDER_URL =
  'https://functions.poehali.dev/0b6023e2-f640-4c89-b886-84910c780c40';

type Totem = {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
};

const TOTEMS: Totem[] = [
  {
    id: 'bars',
    name: 'Барс',
    subtitle: 'Сила и целеустремлённость',
    icon: 'Cat',
    description:
      'Символ силы, защиты и целеустремлённости. Помогает добиваться целей, преодолевая любые препятствия, обеспечивает мощную защиту от внешних угроз и дарит высокое покровительство на пути к успеху.',
  },
  {
    id: 'valkyrie',
    name: 'Валькирия',
    subtitle: 'Защита отношений',
    icon: 'Shield',
    description:
      'Для тех, кто в отношениях и желает защитить их от посягательств соперниц. Создаёт невидимый щит вокруг ваших отношений, отбивает атаки недоброжелателей и укрепляет связь с партнёром.',
  },
  {
    id: 'medusa',
    name: 'Медуза Горгона',
    subtitle: 'Тайные знания',
    icon: 'Eye',
    description:
      'Наделяет магическими знаниями и тайными познаниями. Обеспечивает мощную защиту от злых сил и направляет энергию врагов против них самих. Идеальный выбор для тех, кто стремится в мир эзотерики.',
  },
  {
    id: 'wolf',
    name: 'Волчица',
    subtitle: 'Защита от гибели',
    icon: 'Dog',
    description:
      'Защищает владельца от пуль и напрасной гибели. Подходит для воинов и тех, чья жизнь связана с риском. Оберегает от физических опасностей и помогает сохранить здоровье даже в сложных ситуациях.',
  },
  {
    id: 'zevana',
    name: 'Зевана',
    subtitle: 'Женское здоровье',
    icon: 'Flower2',
    description:
      'Дарует гармонию женщине и способствует восстановлению женского здоровья. Особенно полезен тем, кто стремится к созданию семьи. Помогает преодолеть проблемы с зачатием и дарит радость материнства.',
  },
  {
    id: 'bayun',
    name: 'Кот Баюн',
    subtitle: 'Чёрная и белая магия',
    icon: 'Moon',
    description:
      'Предоставляет знания как чёрной, так и белой магии. Идеален для эзотериков и тех, кто интересуется оккультными науками. Открывает двери к новым знаниям и тайнам вселенной.',
  },
  {
    id: 'belorybica',
    name: 'Белорыбица',
    subtitle: 'Царевна Лебедь',
    icon: 'Sparkles',
    description:
      'Дарует красоту, грацию и новые навыки. Помогает раскрыть ваш потенциал и стать привлекательнее. Вдохновляет на творчество и самосовершенствование, помогая достичь гармонии с собой и миром.',
  },
];

type CartItem = { totem: Totem; qty: number };

export default function Index() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [active, setActive] = useState<Totem | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', comment: '' });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * PRICE, 0);

  const addToCart = (totem: Totem) => {
    setCart((prev) => {
      const found = prev.find((i) => i.totem.id === totem.id);
      if (found)
        return prev.map((i) =>
          i.totem.id === totem.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { totem, qty: 1 }];
    });
    toast({ title: `Тотем «${totem.name}» добавлен в корзину` });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.totem.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const [sending, setSending] = useState(false);

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(ORDER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contact: form.contact,
          comment: form.comment,
          total: cartTotal,
          items: cart.map((i) => ({ name: i.totem.name, qty: i.qty })),
        }),
      });
      if (!res.ok) throw new Error('fail');
      setCheckoutOpen(false);
      setCart([]);
      setForm({ name: '', contact: '', comment: '' });
      toast({
        title: 'Заявка отправлена',
        description: 'Ольга свяжется с вами для подтверждения заказа.',
      });
    } catch {
      toast({
        title: 'Не удалось отправить',
        description: 'Попробуйте ещё раз или напишите Ольге напрямую.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatPrice = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-marcellus text-lg tracking-wide">
            <Icon name="Moon" className="text-gold" size={20} />
            <span className="text-foreground">Тотемы Ольги</span>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button className="relative flex items-center gap-2 px-4 py-2 gold-border rounded-sm hover:bg-secondary/60 transition-colors">
                <Icon name="ShoppingBag" className="text-gold" size={18} />
                <span className="hidden sm:inline text-sm text-foreground/90">
                  Корзина
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-[11px] rounded-full bg-gold text-primary-foreground font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="bg-card border-l border-border w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl text-gold">
                  Ваша корзина
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cart.length === 0 && (
                  <div className="text-center text-muted-foreground pt-16">
                    <Icon
                      name="ShoppingBag"
                      size={40}
                      className="mx-auto mb-3 opacity-40"
                    />
                    <p>Корзина пуста</p>
                  </div>
                )}
                {cart.map((item) => (
                  <div
                    key={item.totem.id}
                    className="flex items-center gap-3 p-3 rounded-sm bg-secondary/40 border border-border"
                  >
                    <div className="w-11 h-11 flex items-center justify-center rounded-sm bg-violet/20 gold-border shrink-0">
                      <Icon
                        name={item.totem.icon}
                        className="text-gold"
                        size={20}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-marcellus text-foreground truncate">
                        {item.totem.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(PRICE)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(item.totem.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-sm border border-border hover:bg-secondary"
                      >
                        <Icon name="Minus" size={14} />
                      </button>
                      <span className="w-5 text-center text-sm">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => changeQty(item.totem.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-sm border border-border hover:bg-secondary"
                      >
                        <Icon name="Plus" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Итого:</span>
                    <span className="font-display text-2xl text-gold">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <Button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full bg-gold text-primary-foreground hover:bg-gold/90 font-marcellus tracking-wide h-12"
                  >
                    Оформить заказ
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <p className="font-marcellus text-gold tracking-[0.3em] uppercase text-sm mb-5">
              Магическая защита
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6">
              Покровительство
              <br />
              <span className="gold-gradient">древних тотемов</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
              Ведьма Ольга создаёт мощнейшие тотемы-обереги. Каждый обладает
              уникальной силой и направленностью, способной защитить вас и
              даровать особые блага.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#catalog">
                <Button className="bg-gold text-primary-foreground hover:bg-gold/90 font-marcellus tracking-wide h-12 px-8">
                  Выбрать тотем
                </Button>
              </a>
              <a href="#about">
                <Button
                  variant="outline"
                  className="gold-border bg-transparent hover:bg-secondary/60 font-marcellus tracking-wide h-12 px-8"
                >
                  Об Ольге
                </Button>
              </a>
            </div>
          </div>

          <div
            className="relative animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 rounded-full bg-violet/30 blur-3xl animate-float-slow" />
            <img
              src={HERO_IMG}
              alt="Магический тотем"
              className="relative rounded-lg w-full max-w-md mx-auto glow-violet animate-float-slow"
            />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-16 md:py-24 relative">
        <div className="container">
          <div className="text-center mb-14">
            <p className="font-marcellus text-gold tracking-[0.3em] uppercase text-sm mb-3">
              Коллекция
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Семь тотемов силы
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOTEMS.map((totem, i) => (
              <div
                key={totem.id}
                className="group relative p-7 rounded-lg bg-card border border-border hover:border-gold/50 transition-all duration-500 hover:-translate-y-1 hover:glow-gold animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="absolute top-7 right-7 text-5xl font-display text-border/40 group-hover:text-gold/20 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="w-14 h-14 flex items-center justify-center rounded-sm bg-violet/20 gold-border mb-5 group-hover:glow-gold transition-all">
                  <Icon name={totem.icon} className="text-gold" size={26} />
                </div>
                <h3 className="font-marcellus text-2xl mb-1">{totem.name}</h3>
                <p className="text-gold/80 text-sm mb-4 font-marcellus tracking-wide">
                  {totem.subtitle}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                  {totem.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-gold">
                    {formatPrice(PRICE)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActive(totem)}
                      className="w-10 h-10 flex items-center justify-center rounded-sm border border-border hover:bg-secondary transition-colors"
                      aria-label="Подробнее"
                    >
                      <Icon
                        name="Info"
                        size={18}
                        className="text-foreground/70"
                      />
                    </button>
                    <button
                      onClick={() => addToCart(totem)}
                      className="w-10 h-10 flex items-center justify-center rounded-sm bg-gold text-primary-foreground hover:bg-gold/90 transition-colors"
                      aria-label="В корзину"
                    >
                      <Icon name="Plus" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Conditions */}
      <section id="about" className="py-16 md:py-24 relative">
        <div className="container">
          <div className="max-w-4xl mx-auto rounded-lg border border-border bg-card/60 p-8 md:p-14 glow-violet">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Icon
                  name="Coins"
                  className="text-gold mx-auto mb-3"
                  size={32}
                />
                <p className="font-display text-2xl text-gold mb-1">
                  {formatPrice(PRICE)}
                </p>
                <p className="text-muted-foreground text-sm">Стоимость тотема</p>
              </div>
              <div>
                <Icon
                  name="Hourglass"
                  className="text-gold mx-auto mb-3"
                  size={32}
                />
                <p className="font-display text-2xl text-gold mb-1">1 месяц</p>
                <p className="text-muted-foreground text-sm">
                  Срок изготовления
                </p>
              </div>
              <div>
                <Icon name="Send" className="text-gold mx-auto mb-3" size={32} />
                <p className="font-display text-2xl text-gold mb-1">Личка</p>
                <p className="text-muted-foreground text-sm">Запись на заказ</p>
              </div>
            </div>
            <p className="text-center text-muted-foreground text-sm mt-10 leading-relaxed max-w-2xl mx-auto">
              Тотемы создаются вручную специально для вас. Выберите тот, что
              соответствует вашим потребностям, и почувствуйте его могущество в
              действии.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container text-center space-y-3">
          <div className="flex items-center justify-center gap-2 font-marcellus text-lg">
            <Icon name="Moon" className="text-gold" size={18} />
            Тотемы Ольги
          </div>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Информация предоставлена исключительно в развлекательных целях и не
            является руководством к действию.
          </p>
        </div>
      </footer>

      {/* Totem detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <div className="w-16 h-16 flex items-center justify-center rounded-sm bg-violet/20 gold-border mb-3 glow-gold">
                  <Icon name={active.icon} className="text-gold" size={30} />
                </div>
                <DialogTitle className="font-display text-3xl text-gold">
                  Тотем {active.name}
                </DialogTitle>
                <p className="text-gold/70 font-marcellus tracking-wide">
                  {active.subtitle}
                </p>
              </DialogHeader>
              <p className="text-muted-foreground leading-relaxed">
                {active.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-display text-2xl text-gold">
                  {formatPrice(PRICE)}
                </span>
                <Button
                  onClick={() => {
                    addToCart(active);
                    setActive(null);
                  }}
                  className="bg-gold text-primary-foreground hover:bg-gold/90 font-marcellus tracking-wide"
                >
                  <Icon name="Plus" size={16} className="mr-1" /> В корзину
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl text-gold">
              Оформление заказа
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              К оплате: {formatPrice(cartTotal)} · {cartCount} шт.
            </p>
          </DialogHeader>
          <form onSubmit={submitOrder} className="space-y-4">
            <div>
              <label className="text-sm text-foreground/80 mb-1.5 block">
                Ваше имя
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Имя"
                className="bg-secondary/40 border-border"
              />
            </div>
            <div>
              <label className="text-sm text-foreground/80 mb-1.5 block">
                Телефон или Telegram
              </label>
              <Input
                required
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="+7 ... или @username"
                className="bg-secondary/40 border-border"
              />
            </div>
            <div>
              <label className="text-sm text-foreground/80 mb-1.5 block">
                Комментарий
              </label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Пожелания к заказу"
                className="bg-secondary/40 border-border resize-none"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-gold text-primary-foreground hover:bg-gold/90 font-marcellus tracking-wide h-12"
            >
              {sending ? 'Отправляем…' : 'Отправить заявку'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}